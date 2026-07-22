import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureUniqueProductSlug,
  slugifyProductText,
} from "@/lib/adminProductText";
import { matchCatalogCategorySuggestion } from "@/lib/catalogCategoryMatching";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

function getSuggestedValue(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);
  const baseUrl = getBaseUrl(req);

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.redirect(`${baseUrl}/admin/products?error=not-found`, {
      status: 303,
    });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return NextResponse.redirect(`${baseUrl}/admin/products?error=not-found`, {
      status: 303,
    });
  }

  const suggestedName = getSuggestedValue(product.suggestedName);

  if (!suggestedName) {
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=no-suggestion`,
      { status: 303 },
    );
  }

  const slug = await ensureUniqueProductSlug(
    slugifyProductText(product.slug || suggestedName),
    productId,
  );

  try {
    const categories = await prisma.catalogCategory.findMany({
      where: { isActive: true },
      include: { subcategories: { where: { isActive: true } } },
    });
    const categoryMatch = matchCatalogCategorySuggestion({
      categories,
      suggestedCategory: product.suggestedCategory,
      suggestedSubCategory: product.suggestedSubCategory,
    });
    const data = {
      name: suggestedName,
      slug,
      shortDescription: getSuggestedValue(product.suggestedShortDescription),
      description: getSuggestedValue(product.suggestedDescription),
      category: categoryMatch.category?.name ?? null,
      subCategory: categoryMatch.subcategory?.name ?? null,
      catalogCategory: categoryMatch.category
        ? { connect: { id: categoryMatch.category.id } }
        : { disconnect: true },
      catalogSubcategory: categoryMatch.subcategory
        ? { connect: { id: categoryMatch.subcategory.id } }
        : { disconnect: true },
      categoryReviewStatus: categoryMatch.status,
      categorySuggestion: categoryMatch.categorySuggestion,
      subCategorySuggestion: categoryMatch.subCategorySuggestion,
      brand: getSuggestedValue(product.suggestedBrand),
      features: getSuggestedValue(product.suggestedFeatures),
      googleTaxonomyId: getSuggestedValue(
        (product as { suggestedGoogleTaxonomyId?: string | null })
          .suggestedGoogleTaxonomyId,
      ),
      googleTaxonomyPath: getSuggestedValue(
        (product as { suggestedGoogleTaxonomyPath?: string | null })
          .suggestedGoogleTaxonomyPath,
      ),
      suggestionStatus: "applied",
    } as Prisma.ProductUpdateInput;

    await prisma.product.update({
      where: { id: productId },
      data,
    });
  } catch (error) {
    console.error("[AdminProductApplySuggestionError]", error);
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=apply-suggestion`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/admin/products/${productId}?success=suggestion-applied`,
    { status: 303 },
  );
}
