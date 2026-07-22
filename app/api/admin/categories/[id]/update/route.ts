import { NextRequest, NextResponse } from "next/server";
import { getChangedFields, writeAdminAuditLog } from "@/lib/adminAuditLog";
import {
  createUniqueCategorySlug,
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
  const categoryId = Number((await params).id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=not-found`, { status: 303 });
  }

  const category = await prisma.catalogCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=not-found`, { status: 303 });
  }

  const formData = await req.formData();
  const name = readCatalogText(formData, "name");
  if (!name) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=name`, { status: 303 });
  }

  const duplicate = await prisma.catalogCategory.findFirst({ where: { name, NOT: { id: categoryId } }, select: { id: true } });
  if (duplicate) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=duplicate`, { status: 303 });
  }

  const nextValues = {
    name,
    slug: await createUniqueCategorySlug(name, categoryId),
    sortOrder: readCatalogSortOrder(formData),
    isActive: formData.get("isActive") === "on",
  };
  const updated = await prisma.catalogCategory.update({ where: { id: categoryId }, data: nextValues });
  await writeAdminAuditLog(req, {
    action: "catalog_category.update",
    entityType: "catalog_category",
    entityId: updated.id,
    entityName: updated.name,
    details: { changedFields: getChangedFields(category, nextValues) },
  });

  return NextResponse.redirect(`${baseUrl}/admin/categories?success=updated`, { status: 303 });
}
