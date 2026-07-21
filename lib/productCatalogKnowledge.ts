import type { ProductSuggestionInput } from "@/lib/productSuggestions";

const knownLogoBrandRefs = new Map<number, string>([[38, "Ovalette"]]);

const abbreviationHints = [
  {
    pattern: /ex\.?\s*k[üu]v|ekstra.*k[üu]v/i,
    meaning: "EX.KÜV ifadesi genellikle Ekstra Kuvertür anlamına gelir.",
  },
  {
    pattern: /s[üu]tl[üu]/i,
    meaning: "SÜTLÜ ifadesi sütlü çikolata/kuvertür bilgisidir.",
  },
  {
    pattern: /% ?\d+/i,
    meaning:
      "Yüzde değeri ürün adında korunmalıdır; örnek: %36 kakao/ürün oranı bilgisi.",
  },
  {
    pattern: /k[ıi]rm[ıi]z[ıi]/i,
    meaning:
      "KIRMIZI ifadesi her zaman renk anlamına gelmeyebilir; çikolata ürünlerinde firma içi seri/kod olabilir, kullanım alanı uydurma.",
  },
  {
    pattern: /kal[ıi]p/i,
    meaning:
      "KALIP ifadesi çikolata/kuvertür form bilgisidir; özellik alanında belirtilebilir.",
  },
];

const knownProductExamples = [
  {
    pattern: /ovalette.*ex\.?\s*k[üu]v.*s[üu]tl[üu].*% ?36/i,
    suggestion:
      "Bu ürün için iyi katalog adı: Ovalette Ekstra Sütlü Kuvertür Çikolata %36 (2,5 KG). Marka: Ovalette. Kategori: Çikolata ve Kakao Ürünleri. Alt kategori: Kuvertür Çikolata.",
  },
];

function getProductText(product: ProductSuggestionInput) {
  return [
    product.name,
    product.logoName,
    product.storeName,
    product.logoDescription2,
    product.logoDescription3,
    product.logoCategoryRaw,
    product.logoSubCategoryRaw,
    product.catalogVerificationNote,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getKnownBrandName(product: ProductSuggestionInput) {
  if (product.logoBrandRef && knownLogoBrandRefs.has(product.logoBrandRef)) {
    return knownLogoBrandRefs.get(product.logoBrandRef) ?? null;
  }

  if (product.logoBrandName) {
    return product.logoBrandName;
  }

  const text = getProductText(product).toLocaleLowerCase("tr-TR");

  if (text.includes("ovalette")) {
    return "Ovalette";
  }

  if (text.includes("fo ")) {
    return "FO";
  }

  return null;
}

export function getProductKnowledgeHints(product: ProductSuggestionInput) {
  const text = getProductText(product);
  const hints: string[] = [];
  const knownBrand = getKnownBrandName(product);

  if (knownBrand) {
    hints.push(`Bilinen marka: ${knownBrand}.`);
  }

  if (product.catalogVerificationNote) {
    hints.push(
      `İç doğrulama notu (web bilgisinden üstündür): ${product.catalogVerificationNote}`,
    );
  }

  for (const item of abbreviationHints) {
    if (item.pattern.test(text)) {
      hints.push(item.meaning);
    }
  }

  for (const item of knownProductExamples) {
    if (item.pattern.test(text)) {
      hints.push(item.suggestion);
    }
  }

  return hints;
}
