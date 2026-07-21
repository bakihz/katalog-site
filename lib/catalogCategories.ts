const categoryAliases = new Map<string, string>([
  ["çikolata", "Çikolata ve Kakao Ürünleri"],
  ["cikolata", "Çikolata ve Kakao Ürünleri"],
  ["çikolata ve kakao ürünleri", "Çikolata ve Kakao Ürünleri"],
  ["cikolata ve kakao urunleri", "Çikolata ve Kakao Ürünleri"],
]);

function normalizeKey(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

export function normalizeCatalogCategory(value: string | null | undefined) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return null;
  }

  return categoryAliases.get(normalizeKey(normalized)) ?? normalized;
}
