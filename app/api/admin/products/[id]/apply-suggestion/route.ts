import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureUniqueProductSlug,
  slugifyProductText,
} from "@/lib/adminProductText";

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
    const data = {
      name: suggestedName,
      slug,
      shortDescription: getSuggestedValue(product.suggestedShortDescription),
      description: getSuggestedValue(product.suggestedDescription),
      category: getSuggestedValue(product.suggestedCategory),
      subCategory: getSuggestedValue(product.suggestedSubCategory),
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
