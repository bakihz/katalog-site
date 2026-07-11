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

function readFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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

  const formData = await req.formData();
  const name = readFormValue(formData, "name");
  const slugInput = readFormValue(formData, "slug");
  const shortDescription = readFormValue(formData, "shortDescription");
  const description = readFormValue(formData, "description");
  const imageUrl = readFormValue(formData, "imageUrl");
  const features = readFormValue(formData, "features");
  const category = readFormValue(formData, "category");
  const subCategory = readFormValue(formData, "subCategory");
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
        category: category || null,
        subCategory: subCategory || null,
        brand: brand || null,
        webStockStatus: webStockStatus || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        showOnWebsite: formData.get("showOnWebsite") === "on",
        isFeatured: formData.get("isFeatured") === "on",
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
