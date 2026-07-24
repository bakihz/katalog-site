import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import {
  getCatalogReadiness,
  getEffectivePublicationStatus,
  isProductPublicationStatus,
} from "@/lib/productCatalogReadiness";
import { prisma } from "@/lib/prisma";

function getBaseUrl(req: NextRequest) {
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

  const formData = await req.formData();
  const requestedStatus = String(formData.get("status") ?? "");

  if (!isProductPublicationStatus(requestedStatus)) {
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=publication-status`,
      { status: 303 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      catalogCategory: { select: { isActive: true } },
      catalogSubcategory: { select: { isActive: true } },
    },
  });

  if (!product) {
    return NextResponse.redirect(`${baseUrl}/admin/products?error=not-found`, {
      status: 303,
    });
  }

  const readiness = getCatalogReadiness(product);

  if (requestedStatus === "published" && !readiness.isReady) {
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=publication-blocked`,
      { status: 303 },
    );
  }

  const previousStatus = getEffectivePublicationStatus(product);
  const isPublished = requestedStatus === "published";

  await prisma.product.update({
    where: { id: productId },
    data: {
      publicationStatus: requestedStatus,
      showOnWebsite: isPublished,
      publishedAt: isPublished ? product.publishedAt ?? new Date() : product.publishedAt,
      isFeatured:
        requestedStatus === "archived" ? false : product.isFeatured,
    },
  });

  await writeAdminAuditLog(req, {
    action: `catalog_product.publication_${requestedStatus}`,
    entityType: "product",
    entityId: product.id,
    entityName: product.name,
    details: {
      previousStatus,
      nextStatus: requestedStatus,
      blockers: readiness.blockers,
      warnings: readiness.warnings,
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/products/${productId}?success=publication-${requestedStatus}`,
    { status: 303 },
  );
}
