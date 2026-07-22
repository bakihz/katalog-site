import { NextRequest, NextResponse } from "next/server";
import { getChangedFields, writeAdminAuditLog } from "@/lib/adminAuditLog";
import {
  createUniqueSubcategorySlug,
  readCatalogSortOrder,
  readCatalogText,
} from "@/lib/catalogCategoryAdmin";
import { prisma } from "@/lib/prisma";

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${req.headers.get("x-forwarded-proto") || "http"}://${host}`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const baseUrl = getBaseUrl(req);
  const subcategoryId = Number((await params).id);
  if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=not-found`, { status: 303 });
  }

  const subcategory = await prisma.catalogSubcategory.findUnique({
    where: { id: subcategoryId },
    include: { category: { select: { name: true } } },
  });
  if (!subcategory) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=not-found`, { status: 303 });
  }

  const formData = await req.formData();
  const name = readCatalogText(formData, "name");
  if (!name) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=subcategory-name`, { status: 303 });
  }

  const duplicate = await prisma.catalogSubcategory.findFirst({
    where: { categoryId: subcategory.categoryId, name, NOT: { id: subcategoryId } },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=subcategory-duplicate`, { status: 303 });
  }

  const nextValues = {
    name,
    slug: await createUniqueSubcategorySlug(subcategory.categoryId, name, subcategoryId),
    sortOrder: readCatalogSortOrder(formData),
    isActive: formData.get("isActive") === "on",
  };
  const updated = await prisma.catalogSubcategory.update({ where: { id: subcategoryId }, data: nextValues });
  await writeAdminAuditLog(req, {
    action: "catalog_subcategory.update",
    entityType: "catalog_subcategory",
    entityId: updated.id,
    entityName: `${subcategory.category.name} / ${updated.name}`,
    details: { changedFields: getChangedFields(subcategory, nextValues) },
  });

  return NextResponse.redirect(`${baseUrl}/admin/categories?success=subcategory-updated`, { status: 303 });
}
