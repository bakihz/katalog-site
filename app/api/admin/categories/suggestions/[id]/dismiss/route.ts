import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const baseUrl = getRequestBaseUrl(req);
  const productId = Number((await params).id);
  const product = Number.isInteger(productId) && productId > 0
    ? await prisma.product.findFirst({
        where: { id: productId, categoryReviewStatus: "review" },
      })
    : null;

  if (!product) {
    return NextResponse.redirect(
      `${baseUrl}/admin/categories?error=suggestion-not-found`,
      { status: 303 },
    );
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { categoryReviewStatus: "dismissed" },
  });

  await writeAdminAuditLog(req, {
    action: "catalog_category_suggestion.dismiss",
    entityType: "product",
    entityId: product.id,
    entityName: product.name,
    details: {
      categorySuggestion: product.categorySuggestion,
      subCategorySuggestion: product.subCategorySuggestion,
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/categories?success=suggestion-dismissed`,
    { status: 303 },
  );
}
