import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRuleBasedProductSuggestion } from "@/lib/productSuggestions";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
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

  try {
    const suggestion = generateRuleBasedProductSuggestion(product);

    await prisma.product.update({
      where: { id: productId },
      data: {
        ...suggestion,
        suggestionStatus: "draft",
        suggestionGeneratedAt: new Date(),
      } satisfies Prisma.ProductUpdateInput,
    });
  } catch (error) {
    console.error("[AdminProductSuggestError]", error);
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=suggestion`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/admin/products/${productId}?success=suggestion-created`,
    { status: 303 },
  );
}
