import {
  findGoogleTaxonomyCandidateById,
  findGoogleTaxonomyCandidates,
  type GoogleTaxonomyCandidate,
} from "@/lib/googleTaxonomy";
import {
  getKnownBrandName,
  getProductKnowledgeHints,
} from "@/lib/productCatalogKnowledge";
import type {
  ProductSuggestion,
  ProductSuggestionInput,
} from "@/lib/productSuggestions";
import type { WebResearchSource } from "@/lib/webResearch";
import { normalizeCatalogCategory } from "@/lib/catalogCategories";

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

const suggestionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    suggestedName: { type: "string" },
    suggestedShortDescription: { type: ["string", "null"] },
    suggestedDescription: { type: ["string", "null"] },
    suggestedCategory: { type: ["string", "null"] },
    suggestedSubCategory: { type: ["string", "null"] },
    suggestedBrand: { type: ["string", "null"] },
    suggestedFeatures: { type: ["string", "null"] },
    suggestedGoogleTaxonomyId: { type: ["string", "null"] },
    suggestedGoogleTaxonomyPath: { type: ["string", "null"] },
    suggestedLearningNotes: { type: ["string", "null"] },
    suggestionConfidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: [
    "suggestedName",
    "suggestedShortDescription",
    "suggestedDescription",
    "suggestedCategory",
    "suggestedSubCategory",
    "suggestedBrand",
    "suggestedFeatures",
    "suggestedGoogleTaxonomyId",
    "suggestedGoogleTaxonomyPath",
    "suggestedLearningNotes",
    "suggestionConfidence",
  ],
};

function getOllamaConfig() {
  return {
    enabled: process.env.OLLAMA_PRODUCT_SUGGESTIONS_ENABLED === "true",
    baseUrl:
      process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") ||
      "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "qwen3:14b",
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 120000),
  };
}

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\u00a0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s*([,.;:/])\s*/g, "$1 ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUnits(value: string) {
  return value
    .replace(/\b(\d+(?:[,.]\d+)?)\s*(kg|kğ|kilogram)\b/gi, "$1 KG")
    .replace(/\b(\d+(?:[,.]\d+)?)\s*(gr|g|gram)\b/gi, "$1 GR")
    .replace(/\b(\d+(?:[,.]\d+)?)\s*(lt|l|litre)\b/gi, "$1 LT")
    .replace(/\b(\d+(?:[,.]\d+)?)\s*(ml|mililitre)\b/gi, "$1 ML")
    .replace(/\b(\d+(?:[,.]\d+)?)\s*(cm|santim)\b/gi, "$1 CM")
    .replace(/\b(\d+(?:[,.]\d+)?)\s*(adet|ad)\b/gi, "$1 adet")
    .replace(/\bgr\b/gi, "GR")
    .replace(/\bkg\b/gi, "KG")
    .replace(/\bml\b/gi, "ML")
    .replace(/\blt\b/gi, "LT");
}

function normalizeNumberSpacing(value: string) {
  return value
    .replace(/(\d)\s*,\s*(\d)/g, "$1,$2")
    .replace(/(\d)\s*\.\s*(\d)/g, "$1.$2");
}

function normalizeFoodCatalogTerms(value: string) {
  return value
    .replace(
      /pastacılık\s+ve\s+konfeksiyon\s+sektörlerinde/gi,
      "pastacılık uygulamalarında",
    )
    .replace(/pastacılık\s+ve\s+konfeksiyon/gi, "pastacılık")
    .replace(/\bkonfeksiyon\b/gi, "konfiseri");
}

function normalizeCatalogText(value: string) {
  return normalizeFoodCatalogTerms(normalizeNumberSpacing(value));
}

function titleCase(value: unknown) {
  const cleaned = normalizeCatalogText(normalizeUnits(cleanText(value)));

  if (!cleaned) {
    return null;
  }

  return cleaned
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((word) => {
      const upper = word.toLocaleUpperCase("tr-TR");

      if (
        ["FO", "KG", "GR", "ML", "LT", "CM", "NO"].includes(upper) ||
        /^\d/.test(word)
      ) {
        return upper;
      }

      if (word.length <= 2) {
        return upper;
      }

      return (
        word.charAt(0).toLocaleUpperCase("tr-TR") +
        word.slice(1).toLocaleLowerCase("tr-TR")
      );
    })
    .join(" ")
    .replace(/\bGr\b/g, "GR")
    .replace(/\bKg\b/g, "KG")
    .replace(/\bMl\b/g, "ML")
    .replace(/\bLt\b/g, "LT")
    .replace(/\bCm\b/g, "CM")
    .replace(/\s+([,.;:/])/g, "$1")
    .trim();
}

function sentenceCase(value: unknown) {
  const cleaned = normalizeCatalogText(normalizeUnits(cleanText(value)));

  if (!cleaned) {
    return null;
  }

  return (
    cleaned.charAt(0).toLocaleUpperCase("tr-TR") +
    cleaned.slice(1).replace(/\s+/g, " ")
  )
    .replace(/(\d)\s*,\s*(\d)/g, "$1,$2")
    .replace(/(\d)\s*\.\s*(\d)/g, "$1.$2")
    .replace(/\s+([,.;:/])/g, "$1")
    .trim();
}

function normalizeMultiline(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const lines = value
    .split(/\r?\n/)
    .map((line) => sentenceCase(line))
    .filter(Boolean);

  return lines.length ? Array.from(new Set(lines)).join("\n") : null;
}

function normalizeNullable(value: unknown) {
  return sentenceCase(value);
}

function decodeJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
}

function parseJsonObject(rawResponse: string) {
  const trimmed = rawResponse
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  const candidate =
    jsonStart >= 0 && jsonEnd > jsonStart
      ? trimmed.slice(jsonStart, jsonEnd + 1)
      : trimmed;

  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const recovered: Record<string, unknown> = {};
    const fieldPattern =
      /"([^"]+)"\s*:\s*(?:"((?:\\.|[^"\\])*)"|null|(-?\d+(?:\.\d+)?))/g;
    let match: RegExpExecArray | null;

    while ((match = fieldPattern.exec(candidate))) {
      const [, key, stringValue, numberValue] = match;
      if (!key) continue;

      if (typeof stringValue === "string") {
        recovered[key] = decodeJsonString(stringValue);
      } else if (typeof numberValue === "string") {
        recovered[key] = Number(numberValue);
      } else {
        recovered[key] = null;
      }
    }

    return recovered;
  }
}

function parseSuggestion({
  rawResponse,
  model,
  product,
  taxonomyCandidates,
  webSources,
}: {
  rawResponse: string;
  model: string;
  product: ProductSuggestionInput;
  taxonomyCandidates: GoogleTaxonomyCandidate[];
  webSources: WebResearchSource[];
}): ProductSuggestion {
  const parsed = parseJsonObject(rawResponse);
  const suggestedName = titleCase(parsed.suggestedName);

  if (!suggestedName) {
    throw new Error("Ollama yanıtında önerilen ürün adı yok.");
  }

  const confidence = Number(parsed.suggestionConfidence);
  const taxonomyId = cleanText(parsed.suggestedGoogleTaxonomyId) || null;
  const taxonomyCandidate = findGoogleTaxonomyCandidateById(
    taxonomyCandidates,
    taxonomyId,
  );
  const knownBrand = getKnownBrandName(product);
  const hasWebSources = webSources.length > 0;
  const hasInternalVerification = Boolean(product.catalogVerificationNote?.trim());
  const maximumConfidence = hasInternalVerification ? 0.9 : hasWebSources ? 0.7 : 0.75;
  const verificationStatus = hasInternalVerification ? "ready" : "review";
  const suggestionWarnings = hasInternalVerification
    ? "İç doğrulama notu dikkate alındı. Yine de web kaynaklarındaki teknik ayrıntıları kontrol edin."
    : hasWebSources
      ? "Web kaynakları benzer bir ürüne ait olabilir. Ürün varyantı, raf ömrü, saklama koşulu ve teknik ayrıntıları onaylamadan yayınlamayın."
      : "Bu taslak yalnız Logo verisine dayanır. Ürün varyantı ve teknik ayrıntıları onaylamadan yayınlamayın.";

  return {
    suggestedName,
    suggestedShortDescription: normalizeNullable(
      parsed.suggestedShortDescription,
    ),
    suggestedDescription: normalizeNullable(parsed.suggestedDescription),
    suggestedCategory: normalizeCatalogCategory(titleCase(parsed.suggestedCategory)),
    suggestedSubCategory: titleCase(parsed.suggestedSubCategory),
    suggestedBrand: titleCase(parsed.suggestedBrand) ?? knownBrand,
    suggestedFeatures: normalizeMultiline(parsed.suggestedFeatures),
    suggestedGoogleTaxonomyId: taxonomyCandidate?.id ?? null,
    suggestedGoogleTaxonomyPath: taxonomyCandidate?.path ?? null,
    suggestedSourceUrls: webSources.length
      ? webSources.map((source) => source.url).join("\n")
      : null,
    suggestedLearningNotes: normalizeMultiline(parsed.suggestedLearningNotes),
    suggestionConfidence:
      Number.isFinite(confidence) && confidence >= 0 && confidence <= 1
        ? Math.min(confidence, maximumConfidence)
        : Math.min(0.7, maximumConfidence),
    suggestionVerificationStatus: verificationStatus,
    suggestionWarnings,
    suggestionSource: webSources.length
      ? `ollama-web:${model}`
      : `ollama:${model}`,
  };
}

function buildPrompt({
  product,
  taxonomyCandidates,
  webSources,
}: {
  product: ProductSuggestionInput;
  taxonomyCandidates: GoogleTaxonomyCandidate[];
  webSources: WebResearchSource[];
}) {
  const knowledgeHints = getProductKnowledgeHints(product);

  return [
    "Sen Lale EDT Gıda için profesyonel ürün katalog editörüsün.",
    "Logo Tiger 3'ten gelen ham ürün verisini müşteriye gösterilecek katalog taslağına dönüştür.",
    "",
    "ÇOK ÖNEMLİ kurallar:",
    "- Sadece geçerli JSON döndür.",
    "- Stok kodunu ASLA değiştirme, önerilen ad/açıklama/özellik içine stok kodunu yazma.",
    "- Logo ham verisini değiştirme; sadece katalog önerisi üret.",
    "- Ürün adı katalog adı gibi kısa ve temiz olsun.",
    "- Ölçü birimleri her zaman büyük yazılsın: 100 GR, 1 KG, 500 ML, 10 LT.",
    "- FO gibi marka/kısaltma olabilecek ifadeleri büyük bırak.",
    "- Kısa açıklama koli/adet bilgisinden ibaret olmasın; ürünün ne olduğunu özetlesin.",
    "- Koli içi, paket adedi, gramaj gibi bilgiler varsa suggestedFeatures alanına yaz.",
    "- Açıklama 1-2 cümle olsun; abartılı reklam dili kullanma.",
    "- Emin değilsen marka alanını null bırak.",
    "- Kategori genel; alt kategori daha spesifik olmalı. Örnek: Gıda Boyaları / Jel Boya.",
    "- Google taxonomy için sadece aşağıdaki aday listesinden id/path seç.",
    "- Aday listesindeki id/path birebir eşleşmiyorsa taxonomy alanlarını null bırak.",
    "- Uygun aday yoksa suggestedGoogleTaxonomyId ve suggestedGoogleTaxonomyPath alanlarını null bırak.",
    "- Uydurma teknik özellik, fiyat, stok veya marka yazma.",
    "- Web kaynakları verildiyse bilgiyi birebir kopyalama; kaynakları özetleyip katalog diline çevir.",
    "- Web kaynağı ile Logo verisi çelişirse Logo verisini ve admin onayını esas al.",
    "- İç doğrulama notu varsa kesin doğru kabul et; web kaynağı bununla çelişirse web bilgisini kullanma.",
    "- İç doğrulama notu yokken web kaynakları eko/standart/premium gibi varyant bilgisi vermiyorsa ürün varyantı hakkında hüküm yazma.",
    "- Web kaynakları teknik ayrıntılarda çelişiyorsa raf ömrü, saklama koşulu, sıcaklık ve kullanım şekli gibi tartışmalı bilgileri yazma.",
    "- Kalıcı sözlüğe eklenebilecek yalnız terim/kısaltma/marka öğrenimleri varsa suggestedLearningNotes alanına kısa maddeler halinde yaz. Bu alana teknik özellik, kullanım, saklama veya raf ömrü yazma.",
    "",
    "İyi örnek:",
    JSON.stringify(
      {
        suggestedName: "FO Jel Gıda Boyası Mor (100 GR)",
        suggestedShortDescription:
          "Pasta ve tatlı dekorasyonlarında kullanılan mor jel gıda boyası.",
        suggestedDescription:
          "Mor renkli jel gıda boyası, pasta ve tatlı uygulamalarında renklendirme amacıyla kullanılır. 100 GR ambalajdadır.",
        suggestedCategory: "Gıda Boyaları",
        suggestedSubCategory: "Jel Boya",
        suggestedBrand: "FO",
        suggestedFeatures: "Ambalaj: 100 GR\nKoli içi: 12 adet",
        suggestedGoogleTaxonomyId: null,
        suggestedGoogleTaxonomyPath: null,
        suggestedLearningNotes:
          "FO -> Marka\nJel gıda boyası -> Gıda Boyaları / Jel Boya",
        suggestionConfidence: 0.82,
      },
      null,
      2,
    ),
    "",
    "Ek şirket kuralları:",
    "- Logo kısaltmalarını anlamlandır; bildiğin kısaltmayı ham haliyle bırakma.",
    "- EX.KÜV gibi ifadeleri Ekstra Kuvertür olarak genişlet.",
    "- Ürün adındaki % değerlerini koru; örnek: %36.",
    "- Ondalıklı gramajlarda virgülden sonra boşluk bırakma. Doğru: 2,5 KG. Yanlış: 2, 5 KG.",
    "- Konfiseri bir gıda/çikolata ürün tipidir; konfeksiyon tekstil anlamı taşır. Gıda ürünlerinde konfeksiyon kelimesini yazma.",
    "- Ham veride olmayan kullanım alanı yazma. Örneğin çikolata/kuvertür için kızartma/pişirme gibi uydurma kullanım yazma.",
    "",
    "Google taxonomy adayları:",
    JSON.stringify(taxonomyCandidates, null, 2),
    "",
    "Şirket sözlüğü ve ipuçları:",
    JSON.stringify(knowledgeHints, null, 2),
    "",
    "Web kaynakları:",
    JSON.stringify(webSources, null, 2),
    "",
    "Ham ürün verisi:",
    JSON.stringify(
      {
        stockCode: product.stockCode,
        currentCatalogName: product.name,
        logoName: product.logoName,
        storeName: product.storeName,
        logoDescription2: product.logoDescription2,
        logoDescription3: product.logoDescription3,
        logoCategoryRaw: product.logoCategoryRaw,
        logoSubCategoryRaw: product.logoSubCategoryRaw,
        logoBrandRef: product.logoBrandRef,
        logoBrandName: product.logoBrandName,
        logoUnitName: product.logoUnitName,
        catalogVerificationNote: product.catalogVerificationNote,
        producerCode: product.producerCode,
        currentBrand: product.brand,
        currentCategory: product.category,
        currentSubCategory: product.subCategory,
      },
      null,
      2,
    ),
  ].join("\n");
}

export function isOllamaProductSuggestionEnabled() {
  return getOllamaConfig().enabled;
}

export async function generateOllamaProductSuggestion(
  product: ProductSuggestionInput,
  options?: {
    webSources?: WebResearchSource[];
  },
): Promise<ProductSuggestion> {
  const config = getOllamaConfig();

  if (!config.enabled) {
    throw new Error("Ollama ürün önerisi env ayarı kapalı.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const taxonomyCandidates = findGoogleTaxonomyCandidates(product, 30);
  const webSources = options?.webSources ?? [];

  try {
    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        prompt: buildPrompt({ product, taxonomyCandidates, webSources }),
        stream: false,
        format: suggestionSchema,
        options: {
          temperature: 0.15,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const payload = (await response.json()) as OllamaGenerateResponse;

    if (payload.error) {
      throw new Error(payload.error);
    }

    if (!payload.response) {
      throw new Error("Ollama boş yanıt döndü.");
    }

    return parseSuggestion({
      rawResponse: payload.response,
      model: config.model,
      product,
      taxonomyCandidates,
      webSources,
    });
  } finally {
    clearTimeout(timeout);
  }
}
