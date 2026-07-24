import { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const publicProductBaseWhere: Prisma.ProductWhereInput = {
  showOnWebsite: true,
  logoIsActive: true,
  catalogCategory: { isActive: true },
  OR: [
    { catalogSubcategoryId: null },
    { catalogSubcategory: { isActive: true } },
  ],
};

const publishedProductRelationWhere: Prisma.ProductWhereInput = {
  showOnWebsite: true,
  logoIsActive: true,
  OR: [
    { catalogSubcategoryId: null },
    { catalogSubcategory: { isActive: true } },
  ],
};

export const getPublicCategorySummaries = cache(function getPublicCategorySummaries() {
  return prisma.catalogCategory.findMany({
    where: {
      isActive: true,
      products: { some: publishedProductRelationWhere },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      showOnHomepage: true,
      homepageSortOrder: true,
      homepageTitle: true,
      homepageDescription: true,
      homepageImageUrl: true,
      _count: {
        select: { products: { where: publishedProductRelationWhere } },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
});

export const getPublicCategoryBySlug = cache(function getPublicCategoryBySlug(
  slug: string,
) {
  return prisma.catalogCategory.findFirst({
    where: {
      slug,
      isActive: true,
      products: { some: publishedProductRelationWhere },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      showOnHomepage: true,
      homepageSortOrder: true,
      homepageTitle: true,
      homepageDescription: true,
      homepageImageUrl: true,
      subcategories: {
        where: {
          isActive: true,
          products: {
            some: { showOnWebsite: true, logoIsActive: true },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: { showOnWebsite: true, logoIsActive: true },
              },
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: {
        select: { products: { where: publishedProductRelationWhere } },
      },
    },
  });
});

export const getHomepageProductShowcase = cache(
  function getHomepageProductShowcase() {
    return prisma.product.findMany({
      where: publicProductBaseWhere,
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        imageUrl: true,
        shortDescription: true,
        catalogCategory: { select: { name: true } },
      },
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: 4,
    });
  },
);

export type PublicCatalogCategorySummary = Awaited<
  ReturnType<typeof getPublicCategorySummaries>
>[number];

export type PublicCatalogCategory = NonNullable<
  Awaited<ReturnType<typeof getPublicCategoryBySlug>>
>;
