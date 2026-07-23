import { Prisma } from "@prisma/client";
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

export function getPublicCategories() {
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
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export type PublicCatalogCategory = Awaited<
  ReturnType<typeof getPublicCategories>
>[number];
