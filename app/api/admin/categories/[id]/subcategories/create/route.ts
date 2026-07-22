import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
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
  const categoryId = Number((await params).id);
  const category = Number.isInteger(categoryId) && categoryId > 0
    ? await prisma.catalogCategory.findUnique({ where: { id: categoryId } })
    : null;
  if (!category) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=not-found`, { status: 303 });
  }

  const formData = await req.formData();
  const name = readCatalogText(formData, "name");
  if (!name) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=subcategory-name`, { status: 303 });
  }
  const duplicate = await prisma.catalogSubcategory.findFirst({ where: { categoryId, name }, select: { id: true } });
  if (duplicate) {
    return NextResponse.redirect(`${baseUrl}/admin/categories?error=subcategory-duplicate`, { status: 303 });
  }

  const subcategory = await prisma.catalogSubcategory.create({
    data: {
      categoryId,
      name,
      slug: await createUniqueSubcategorySlug(categoryId, name),
      sortOrder: readCatalogSortOrder(formData),
    },
  });
  await writeAdminAuditLog(req, {
    action: "catalog_subcategory.create",
    entityType: "catalog_subcategory",
    entityId: subcategory.id,
    entityName: `${category.name} / ${subcategory.name}`,
  });

  return NextResponse.redirect(`${baseUrl}/admin/categories?success=subcategory-created`, { status: 303 });
}
