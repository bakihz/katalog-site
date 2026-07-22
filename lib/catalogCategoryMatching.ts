import { CatalogCategory, CatalogSubcategory } from "@prisma/client";
import { slugifyProductText } from "@/lib/adminProductText";

export type CatalogCategoryWithSubcategories = CatalogCategory & {
  subcategories: CatalogSubcategory[];
};

function normalizeMatchText(value: string | null | undefined) {
  const text = String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/&/g, " ve ")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return slugifyProductText(text);
}

function findCategoryByText(
  categories: CatalogCategoryWithSubcategories[],
  value: string | null | undefined,
) {
  const key = normalizeMatchText(value);

  if (!key) return null;

  return (
    categories.find(
      (category) =>
        normalizeMatchText(category.name) === key ||
        normalizeMatchText(category.slug) === key,
    ) ?? null
  );
}

function findSubcategoryByText(
  category: CatalogCategoryWithSubcategories | null,
  value: string | null | undefined,
) {
  const key = normalizeMatchText(value);

  if (!category || !key) return null;

  return (
    category.subcategories.find(
      (subcategory) =>
        normalizeMatchText(subcategory.name) === key ||
        normalizeMatchText(subcategory.slug) === key,
    ) ?? null
  );
}

export function matchCatalogCategorySuggestion({
  categories,
  suggestedCategory,
  suggestedSubCategory,
}: {
  categories: CatalogCategoryWithSubcategories[];
  suggestedCategory: string | null | undefined;
  suggestedSubCategory: string | null | undefined;
}) {
  const category = findCategoryByText(categories, suggestedCategory);
  const subcategory = findSubcategoryByText(category, suggestedSubCategory);
  const hasSuggestedSubcategory = Boolean(String(suggestedSubCategory ?? "").trim());
  const isFullyMatched = Boolean(
    category && (!hasSuggestedSubcategory || subcategory),
  );

  return {
    category,
    subcategory,
    status: isFullyMatched ? "assigned" : "review",
    categorySuggestion: String(suggestedCategory ?? "").trim() || null,
    subCategorySuggestion: String(suggestedSubCategory ?? "").trim() || null,
  };
}
