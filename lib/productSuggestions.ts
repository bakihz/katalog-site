type ProductSuggestionInput = {
  name: string;
  stockCode: string | null;
  logoName: string | null;
  storeName: string | null;
  logoDescription2: string | null;
  logoDescription3: string | null;
  logoCategoryRaw: string | null;
  logoSubCategoryRaw: string | null;
  producerCode: string | null;
  brand: string | null;
  category: string | null;
  subCategory: string | null;
};

export type ProductSuggestion = {
  suggestedName: string;
  suggestedShortDescription: string | null;
  suggestedDescription: string | null;
  suggestedCategory: string | null;
  suggestedSubCategory: string | null;
  suggestedBrand: string | null;
  suggestedFeatures: string | null;
  suggestionConfidence: number;
  suggestionSource: string;
};

const categoryRules: Array<[RegExp, string]> = [
  [/çikolata|cikolata|kuvert[uü]r|damla/i, "Çikolata ve Kakao Ürünleri"],
  [/ya[gğ]|margarin|tereya[gğ]|pastal[ıi]k/i, "Yağlar"],
  [/un|ni[şs]asta|kabartma|maya/i, "Un ve Yardımcı Malzemeler"],
  [/krema|s[üu]t|peynir/i, "Süt ve Krema Ürünleri"],
  [/sos|dolgu|glaz[uü]r|jöle|jele/i, "Sos ve Dolgu Ürünleri"],
  [/renk|boya|g[ıi]da boyas[ıi]/i, "Gıda Boyaları"],
  [/aroma|esans/i, "Aroma ve Esanslar"],
  [/baharat|tar[çc][ıi]n|karabiber|kimyon/i, "Baharatlar"],
  [/ambalaj|kutu|po[şs]et|kap/i, "Ambalaj Ürünleri"],
  [/pasta|dekor|s[uü]s|inci|boncuk/i, "Pasta Süsleme"],
];

const alwaysUppercaseWords = new Set([
  "AA",
  "CC",
  "CM",
  "GR",
  "KG",
  "LT",
  "ML",
  "NO",
  "PK",
]);

const brandLikeWords = new Set([
  "ALBA",
  "ALTINMARKA",
  "BAKELS",
  "BARRY",
  "CALLEBAUT",
  "FO",
  "OVABEY",
  "PURATOS",
  "ŞÖLEN",
  "TORKU",
  "ULKER",
  "ÜLKER",
]);

function cleanText(value: string | null | undefined) {
  return String(value ?? "")
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

function normalizeUnitSpacing(value: string) {
  return value
    .replace(/\b(\d+)\s*(kg|kğ|kilogram)\b/gi, "$1 KG")
    .replace(/\b(\d+)\s*(gr|g|gram)\b/gi, "$1 GR")
    .replace(/\b(\d+)\s*(lt|l|litre)\b/gi, "$1 LT")
    .replace(/\b(\d+)\s*(ml|mililitre)\b/gi, "$1 ML")
    .replace(/\b(\d+)\s*(cm|santim)\b/gi, "$1 CM")
    .replace(/\b(\d+)\s*(adet|ad)\b/gi, "$1 Adet");
}

function normalizeNumberSpacing(value: string) {
  return value
    .replace(/(\d)\s*,\s*(\d)/g, "$1,$2")
    .replace(/(\d)\s*\.\s*(\d)/g, "$1.$2")
    .replace(/\s*x\s*/gi, " x ");
}

function titleCaseWord(word: string) {
  const normalizedWord = word.toLocaleUpperCase("tr-TR");

  if (alwaysUppercaseWords.has(normalizedWord) || brandLikeWords.has(normalizedWord)) {
    return normalizedWord;
  }

  if (/^\d/.test(word)) {
    return normalizedWord;
  }

  if (word.length <= 2) {
    return normalizedWord;
  }

  return (
    word.charAt(0).toLocaleUpperCase("tr-TR") +
    word.slice(1).toLocaleLowerCase("tr-TR")
  );
}

function normalizeTitle(value: string) {
  const cleaned = normalizeNumberSpacing(normalizeUnitSpacing(cleanText(value)));

  if (!cleaned) {
    return "";
  }

  return cleaned
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((part) => {
      if (part.includes("-") && part !== "-") {
        return part
          .split("-")
          .map((piece) => titleCaseWord(piece))
          .join("-");
      }

      if (part.startsWith("(") && part.endsWith(")")) {
        const inner = part.slice(1, -1);
        return `(${titleCaseWord(inner)})`;
      }

      return titleCaseWord(part);
    })
    .join(" ")
    .replace(/\s+([,.;:/])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSentence(value: string) {
  const cleaned = normalizeNumberSpacing(normalizeUnitSpacing(cleanText(value)));

  if (!cleaned) {
    return "";
  }

  const sentence =
    cleaned.charAt(0).toLocaleUpperCase("tr-TR") +
    cleaned.slice(1).replace(/\s+/g, " ");

  return sentence.replace(/\s+([,.;:/])/g, "$1").trim();
}

function pickCategory(product: ProductSuggestionInput) {
  const text = [
    product.category,
    product.logoCategoryRaw,
    product.logoSubCategoryRaw,
    product.logoName,
    product.storeName,
    product.name,
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" ");

  for (const [rule, category] of categoryRules) {
    if (rule.test(text)) {
      return category;
    }
  }

  return (
    normalizeTitle(cleanText(product.category)) ||
    normalizeTitle(cleanText(product.logoCategoryRaw)) ||
    null
  );
}

function pickSubCategory(
  product: ProductSuggestionInput,
  suggestedCategory: string | null,
) {
  const rawSubCategory =
    cleanText(product.subCategory) || cleanText(product.logoSubCategoryRaw);

  if (!rawSubCategory) {
    return null;
  }

  const normalized = normalizeTitle(rawSubCategory);

  if (
    suggestedCategory &&
    normalized.toLocaleLowerCase("tr-TR") ===
      suggestedCategory.toLocaleLowerCase("tr-TR")
  ) {
    return null;
  }

  return normalized;
}

function buildFeatures(product: ProductSuggestionInput) {
  const lines = [
    normalizeSentence(product.logoDescription2 ?? ""),
    normalizeSentence(product.logoDescription3 ?? ""),
    product.producerCode ? `Üretici kodu: ${cleanText(product.producerCode)}` : "",
  ].filter(Boolean);

  return lines.length ? Array.from(new Set(lines)).join("\n") : null;
}

function buildDescription(
  product: ProductSuggestionInput,
  suggestedName: string,
) {
  const descriptionParts = [
    normalizeSentence(product.logoDescription2 ?? ""),
    normalizeSentence(product.logoDescription3 ?? ""),
  ].filter(Boolean);

  if (descriptionParts.length) {
    return Array.from(new Set(descriptionParts)).join("\n\n");
  }

  if (!suggestedName) {
    return null;
  }

  return `${suggestedName}, Lale EDT katalog sistemi için Logo kayıtlarından hazırlanmış ürün taslağıdır. Yayına alınmadan önce ürün açıklaması ve görsel bilgileri kontrol edilmelidir.`;
}

function calculateConfidence(product: ProductSuggestionInput) {
  let score = 0.45;

  if (cleanText(product.storeName)) score += 0.12;
  if (cleanText(product.logoCategoryRaw) || cleanText(product.category)) {
    score += 0.12;
  }
  if (cleanText(product.logoSubCategoryRaw) || cleanText(product.subCategory)) {
    score += 0.08;
  }
  if (cleanText(product.logoDescription2) || cleanText(product.logoDescription3)) {
    score += 0.1;
  }
  if (cleanText(product.brand) || cleanText(product.producerCode)) score += 0.05;

  return Math.min(0.82, Number(score.toFixed(2)));
}

export function generateRuleBasedProductSuggestion(
  product: ProductSuggestionInput,
): ProductSuggestion {
  const suggestedName =
    normalizeTitle(product.storeName ?? "") ||
    normalizeTitle(product.logoName ?? "") ||
    normalizeTitle(product.name) ||
    "İsimsiz Ürün";
  const suggestedCategory = pickCategory(product);
  const suggestedSubCategory = pickSubCategory(product, suggestedCategory);
  const suggestedBrand = product.brand ? normalizeTitle(product.brand) : null;
  const suggestedFeatures = buildFeatures(product);
  const suggestedDescription = buildDescription(product, suggestedName);

  return {
    suggestedName,
    suggestedShortDescription: suggestedCategory
      ? `${suggestedCategory} kategorisi için katalog ürün taslağı.`
      : "Katalog ürün taslağı.",
    suggestedDescription,
    suggestedCategory,
    suggestedSubCategory,
    suggestedBrand,
    suggestedFeatures,
    suggestionConfidence: calculateConfidence(product),
    suggestionSource: "rule-based-v1",
  };
}
