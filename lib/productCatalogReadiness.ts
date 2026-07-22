import { Prisma } from "@prisma/client";

const missingImageWhere: Prisma.ProductWhereInput = {
  OR: [{ imageUrl: null }, { imageUrl: "" }],
};

const missingCategoryWhere: Prisma.ProductWhereInput = {
  catalogCategoryId: null,
};

const missingNameWhere: Prisma.ProductWhereInput = {
  name: "",
};

const missingDescriptionWhere: Prisma.ProductWhereInput = {
  OR: [
    { shortDescription: null },
    { shortDescription: "" },
    { description: null },
    { description: "" },
  ],
};

export const categoryReviewWhere: Prisma.ProductWhereInput = {
  OR: [
    { categoryReviewStatus: "review" },
    {
      AND: [
        { catalogCategoryId: null },
        { NOT: { category: null } },
        { NOT: { category: "" } },
      ],
    },
  ],
};

export const incompleteCatalogProductWhere: Prisma.ProductWhereInput = {
  logoIsActive: true,
  OR: [
    missingImageWhere,
    missingCategoryWhere,
    missingNameWhere,
    missingDescriptionWhere,
    categoryReviewWhere,
  ],
};

export const readyToPublishProductWhere: Prisma.ProductWhereInput = {
  logoIsActive: true,
  showOnWebsite: false,
  name: { not: "" },
  imageUrl: { not: null },
  catalogCategoryId: { not: null },
  shortDescription: { not: null },
  description: { not: null },
  categoryReviewStatus: "assigned",
  AND: [
    { NOT: { imageUrl: "" } },
    { NOT: { shortDescription: "" } },
    { NOT: { description: "" } },
  ],
};

export const productQualityWhere = {
  "missing-image": missingImageWhere,
  "missing-category": missingCategoryWhere,
  "missing-name": missingNameWhere,
  "missing-description": missingDescriptionWhere,
  "category-review": categoryReviewWhere,
  "suggestion-pending": { suggestionStatus: "none" },
  incomplete: incompleteCatalogProductWhere,
  "ready-to-publish": readyToPublishProductWhere,
} satisfies Record<string, Prisma.ProductWhereInput>;

type CatalogReadinessProduct = {
  logoIsActive: boolean;
  name: string;
  imageUrl: string | null;
  catalogCategoryId: number | null;
  categoryReviewStatus: string;
  shortDescription: string | null;
  description: string | null;
};

export function getCatalogReadiness(product: CatalogReadinessProduct) {
  const issues: string[] = [];

  if (!product.name.trim()) issues.push("Katalog adı eksik");
  if (!String(product.imageUrl ?? "").trim()) issues.push("Görsel yok");
  if (!product.catalogCategoryId) issues.push("Kategori yok");
  if (product.categoryReviewStatus === "review") {
    issues.push("Kategori incelenecek");
  }
  if (!String(product.shortDescription ?? "").trim()) {
    issues.push("Kısa açıklama yok");
  }
  if (!String(product.description ?? "").trim()) {
    issues.push("Detay açıklama yok");
  }

  return {
    issues,
    isReady: product.logoIsActive && issues.length === 0,
  };
}
