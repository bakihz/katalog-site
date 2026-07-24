import { getRequestBaseUrl } from "@/lib/requestUrl";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureUniqueProductSlug,
  slugifyProductText,
} from "@/lib/adminProductText";
import {
  getCatalogReadiness,
  getEffectivePublicationStatus,
} from "@/lib/productCatalogReadiness";

function readFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);
  const baseUrl = getRequestBaseUrl(req);

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

  const formData = await req.formData();
  const name = readFormValue(formData, "name");
  const slugInput = readFormValue(formData, "slug");
  const shortDescription = readFormValue(formData, "shortDescription");
  const description = readFormValue(formData, "description");
  const imageUrl = readFormValue(formData, "imageUrl");
  const features = readFormValue(formData, "features");
  const catalogVerificationNote = readFormValue(formData, "catalogVerificationNote");
  const catalogCategoryId = Number(readFormValue(formData, "catalogCategoryId"));
  const catalogSubcategoryId = Number(readFormValue(formData, "catalogSubcategoryId"));
  const brand = readFormValue(formData, "brand");
  const webStockStatus = readFormValue(formData, "webStockStatus");
  const sortOrder = Number(readFormValue(formData, "sortOrder") || 0);

  if (!name) {
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=name`,
      { status: 303 },
    );
  }

  const slug = await ensureUniqueProductSlug(
    slugifyProductText(slugInput || name),
    productId,
  );

  const category =
    Number.isInteger(catalogCategoryId) && catalogCategoryId > 0
      ? await prisma.catalogCategory.findFirst({
          where: { id: catalogCategoryId, isActive: true },
        })
      : null;
  const subcategory =
    Number.isInteger(catalogSubcategoryId) && catalogSubcategoryId > 0
      ? await prisma.catalogSubcategory.findFirst({
          where: {
            id: catalogSubcategoryId,
            categoryId: category?.id ?? -1,
            isActive: true,
          },
        })
      : null;

  if ((catalogCategoryId > 0 && !category) || (catalogSubcategoryId > 0 && !subcategory)) {
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=category`,
      { status: 303 },
    );
  }

  const currentPublicationStatus = getEffectivePublicationStatus(product);
  const nextReadiness = getCatalogReadiness({
    ...product,
    name,
    slug,
    shortDescription: shortDescription || null,
    description: description || null,
    imageUrl: imageUrl || null,
    features: features || null,
    brand: brand || null,
    catalogCategoryId: category?.id ?? null,
    catalogSubcategoryId: subcategory?.id ?? null,
    catalogCategory: category ? { isActive: category.isActive } : null,
    catalogSubcategory: subcategory
      ? { isActive: subcategory.isActive }
      : null,
    categoryReviewStatus: category ? "assigned" : "unassigned",
  });
  const remainsPublished =
    currentPublicationStatus === "published" && nextReadiness.isReady;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        description: description || null,
        imageUrl: imageUrl || null,
        features: features || null,
        catalogVerificationNote: catalogVerificationNote || null,
        category: category?.name ?? null,
        subCategory: subcategory?.name ?? null,
        catalogCategory: category
          ? { connect: { id: category.id } }
          : { disconnect: true },
        catalogSubcategory: subcategory
          ? { connect: { id: subcategory.id } }
          : { disconnect: true },
        categoryReviewStatus: category ? "assigned" : "unassigned",
        brand: brand || null,
        webStockStatus: webStockStatus || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        publicationStatus:
          currentPublicationStatus === "published" && !remainsPublished
            ? "draft"
            : currentPublicationStatus,
        showOnWebsite: remainsPublished,
        isFeatured:
          remainsPublished && formData.get("isFeatured") === "on",
      } satisfies Prisma.ProductUpdateInput,
    });
  } catch (error) {
    console.error("[AdminProductUpdateError]", error);
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=update`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/admin/products/${productId}?success=updated`,
    { status: 303 },
  );
}
