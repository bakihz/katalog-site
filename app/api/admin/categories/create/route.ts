import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import {
  createUniqueCategorySlug,
  readCatalogSortOrder,
  readCatalogText,
} from "@/lib/catalogCategoryAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const baseUrl = getRequestBaseUrl(req);
  const formData = await req.formData();
  const name = readCatalogText(formData, "name");

  if (!name) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=name`, { status: 303 });
  }

  const duplicate = await prisma.catalogCategory.findFirst({ where: { name }, select: { id: true } });
  if (duplicate) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=duplicate`, { status: 303 });
  }

  const category = await prisma.catalogCategory.create({
    data: { name, slug: await createUniqueCategorySlug(name), sortOrder: readCatalogSortOrder(formData) },
  });

  await writeAdminAuditLog(req, {
    action: "catalog_category.create",
    entityType: "catalog_category",
    entityId: category.id,
    entityName: category.name,
  });

  return NextResponse.redirect(`${baseUrl}/admin/categories?success=created`, { status: 303 });
}
