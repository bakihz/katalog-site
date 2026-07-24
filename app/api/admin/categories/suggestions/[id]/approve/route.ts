import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import {
  createUniqueCategorySlug,
  createUniqueSubcategorySlug,
  readCatalogText,
} from "@/lib/catalogCategoryAdmin";
import { matchCatalogCategorySuggestion } from "@/lib/catalogCategoryMatching";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const baseUrl = getRequestBaseUrl(req);
  const productId = Number((await params).id);
  const formData = await req.formData();
  const categoryName = readCatalogText(formData, "categoryName");
  const subcategoryName = readCatalogText(formData, "subcategoryName");

  if (!categoryName) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=name`, {
      status: 303,
    });
  }

  const product = Number.isInteger(productId) && productId > 0
    ? await prisma.product.findFirst({
        where: {
          id: productId,
          categoryReviewStatus: "review",
        },
      })
    : null;

  if (!product) {
    return NextResponse.redirect(
      `${baseUrl}/admin/categories?error=suggestion-not-found`,
      { status: 303 },
    );
  }

  const categories = await prisma.catalogCategory.findMany({
    include: { subcategories: true },
  });
  const existingMatch = matchCatalogCategorySuggestion({
    categories,
    suggestedCategory: categoryName,
    suggestedSubCategory: subcategoryName,
  });

  const category = existingMatch.category
    ? await prisma.catalogCategory.update({
        where: { id: existingMatch.category.id },
        data: { isActive: true },
      })
    : await prisma.catalogCategory.create({
        data: {
          name: categoryName,
          slug: await createUniqueCategorySlug(categoryName),
          isActive: true,
        },
      });

  const subcategory = subcategoryName
    ? existingMatch.subcategory
      ? await prisma.catalogSubcategory.update({
          where: { id: existingMatch.subcategory.id },
          data: { isActive: true },
        })
      : await prisma.catalogSubcategory.create({
          data: {
            categoryId: category.id,
            name: subcategoryName,
            slug: await createUniqueSubcategorySlug(category.id, subcategoryName),
            isActive: true,
          },
        })
    : null;

  await prisma.product.update({
    where: { id: product.id },
    data: {
      category: category.name,
      subCategory: subcategory?.name ?? null,
      catalogCategory: { connect: { id: category.id } },
      catalogSubcategory: subcategory
        ? { connect: { id: subcategory.id } }
        : { disconnect: true },
      categoryReviewStatus: "assigned",
      categorySuggestion: category.name,
      subCategorySuggestion: subcategory?.name ?? null,
      suggestedCategory: category.name,
      suggestedSubCategory: subcategory?.name ?? null,
    },
  });

  await writeAdminAuditLog(req, {
    action: "catalog_category_suggestion.approve",
    entityType: "product",
    entityId: product.id,
    entityName: product.name,
    details: {
      categoryId: category.id,
      categoryName: category.name,
      subcategoryId: subcategory?.id ?? null,
      subcategoryName: subcategory?.name ?? null,
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/categories?success=suggestion-approved`,
    { status: 303 },
  );
}
