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

const missingSlugWhere: Prisma.ProductWhereInput = {
  slug: "",
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
    // missingImageWhere,
    missingCategoryWhere,
    missingNameWhere,
    missingSlugWhere,
    missingDescriptionWhere,
    categoryReviewWhere,
  ],
};

export const readyToPublishProductWhere: Prisma.ProductWhereInput = {
  logoIsActive: true,
  showOnWebsite: false,
  name: { not: "" },
  slug: { not: "" },
  // imageUrl: { not: null },
  catalogCategoryId: { not: null },
  catalogCategory: { isActive: true },
  shortDescription: { not: null },
  description: { not: null },
  categoryReviewStatus: "assigned",
  AND: [
    // { NOT: { imageUrl: "" } },
    { NOT: { shortDescription: "" } },
    { NOT: { description: "" } },
    {
      OR: [
        { catalogSubcategoryId: null },
        { catalogSubcategory: { isActive: true } },
      ],
    },
  ],
};

export const productQualityWhere = {
  "missing-image": missingImageWhere,
  "missing-category": missingCategoryWhere,
  "missing-name": missingNameWhere,
  "missing-slug": missingSlugWhere,
  "missing-description": missingDescriptionWhere,
  "category-review": categoryReviewWhere,
  "suggestion-pending": { suggestionStatus: "none" },
  incomplete: incompleteCatalogProductWhere,
  "ready-to-publish": readyToPublishProductWhere,
} satisfies Record<string, Prisma.ProductWhereInput>;

type CatalogReadinessProduct = {
  logoIsActive: boolean;
  name: string;
  slug: string;
  imageUrl: string | null;
  catalogCategoryId: number | null;
  catalogSubcategoryId?: number | null;
  catalogCategory?: { isActive: boolean } | null;
  catalogSubcategory?: { isActive: boolean } | null;
  categoryReviewStatus: string;
  shortDescription: string | null;
  description: string | null;
  brand?: string | null;
  features?: string | null;
  googleTaxonomyPath?: string | null;
};

export function getCatalogReadiness(product: CatalogReadinessProduct) {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!product.logoIsActive) blockers.push("Logo'da pasif");
  if (!product.name.trim()) blockers.push("Katalog adı eksik");
  if (!product.slug.trim()) blockers.push("Geçerli bağlantı yok");
  // if (!String(product.imageUrl ?? "").trim()) blockers.push("Ana görsel yok");
  if (!product.catalogCategoryId) blockers.push("Kategori yok");
  if (product.catalogCategory && !product.catalogCategory.isActive) {
    blockers.push("Kategori pasif");
  }
  if (
    product.catalogSubcategoryId &&
    product.catalogSubcategory &&
    !product.catalogSubcategory.isActive
  ) {
    blockers.push("Alt kategori pasif");
  }
  if (product.categoryReviewStatus !== "assigned") {
    blockers.push(
      product.categoryReviewStatus === "review"
        ? "Kategori incelenecek"
        : "Kategori onaylanmamış",
    );
  }
  if (!String(product.shortDescription ?? "").trim()) {
    blockers.push("Kısa açıklama yok");
  }
  if (!String(product.description ?? "").trim()) {
    blockers.push("Detay açıklama yok");
  }

  if (!String(product.brand ?? "").trim()) warnings.push("Marka belirtilmemiş");
  if (!product.catalogSubcategoryId) warnings.push("Alt kategori seçilmemiş");
  if (!String(product.features ?? "").trim()) warnings.push("Özellikler eksik");
  if (!String(product.googleTaxonomyPath ?? "").trim()) {
    warnings.push("Google taxonomy seçilmemiş");
  }
  if (product.shortDescription && product.shortDescription.trim().length < 30) {
    warnings.push("Kısa açıklama geliştirilebilir");
  }
  if (product.description && product.description.trim().length < 80) {
    warnings.push("Detay açıklama geliştirilebilir");
  }

  return {
    blockers,
    warnings,
    issues: blockers,
    isReady: blockers.length === 0,
  };
}

export const productPublicationStatuses = [
  "draft",
  "review",
  "published",
  "archived",
] as const;

export type ProductPublicationStatus =
  (typeof productPublicationStatuses)[number];

export function isProductPublicationStatus(
  value: string,
): value is ProductPublicationStatus {
  return productPublicationStatuses.includes(value as ProductPublicationStatus);
}

export function getEffectivePublicationStatus(product: {
  publicationStatus?: string | null;
  showOnWebsite: boolean;
}): ProductPublicationStatus {
  if (product.showOnWebsite) return "published";

  return isProductPublicationStatus(product.publicationStatus ?? "")
    ? (product.publicationStatus as ProductPublicationStatus)
    : "draft";
}

export function getPublicationStatusLabel(status: ProductPublicationStatus) {
  if (status === "review") return "İncelemede";
  if (status === "published") return "Yayında";
  if (status === "archived") return "Arşivlenmiş";
  return "Taslak";
}
