import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import { readyToPublishProductWhere } from "@/lib/productCatalogReadiness";

type BulkAction = "assign-category" | "publish" | "hide";

function getBaseUrl(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  return `${req.headers.get("x-forwarded-proto") || "http"}://${host}`;
}

function readProductIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("productIds")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ).slice(0, 100);
}

function getReturnUrl(req: NextRequest, formData: FormData) {
  const baseUrl = getBaseUrl(req);
  const requested = String(formData.get("returnTo") ?? "");
  const url = new URL(requested || "/admin/products", baseUrl);

  if (url.origin !== baseUrl || url.pathname !== "/admin/products") {
    return new URL("/admin/products", baseUrl);
  }

  return url;
}

function redirectWithResult(
  url: URL,
  result: { success?: string; error?: string; updated?: number; skipped?: number },
) {
  url.searchParams.delete("bulkSuccess");
  url.searchParams.delete("bulkError");
  url.searchParams.delete("updated");
  url.searchParams.delete("skipped");

  if (result.success) url.searchParams.set("bulkSuccess", result.success);
  if (result.error) url.searchParams.set("bulkError", result.error);
  if (result.updated !== undefined) {
    url.searchParams.set("updated", String(result.updated));
  }
  if (result.skipped !== undefined) {
    url.searchParams.set("skipped", String(result.skipped));
  }

  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const returnUrl = getReturnUrl(req, formData);
  const productIds = readProductIds(formData);
  const action = String(formData.get("action") ?? "") as BulkAction;

  if (productIds.length === 0) {
    return redirectWithResult(returnUrl, { error: "selection" });
  }

  try {
    if (action === "assign-category") {
      const categoryId = Number(formData.get("categoryId"));
      const subcategoryId = Number(formData.get("subcategoryId"));
      const category = Number.isInteger(categoryId) && categoryId > 0
        ? await prisma.catalogCategory.findFirst({
            where: { id: categoryId, isActive: true },
          })
        : null;

      if (!category) {
        return redirectWithResult(returnUrl, { error: "category" });
      }

      const subcategory = Number.isInteger(subcategoryId) && subcategoryId > 0
        ? await prisma.catalogSubcategory.findFirst({
            where: {
              id: subcategoryId,
              categoryId: category.id,
              isActive: true,
            },
          })
        : null;

      if (subcategoryId > 0 && !subcategory) {
        return redirectWithResult(returnUrl, { error: "subcategory" });
      }

      const result = await prisma.product.updateMany({
        where: { id: { in: productIds }, logoIsActive: true },
        data: {
          catalogCategoryId: category.id,
          catalogSubcategoryId: subcategory?.id ?? null,
          category: category.name,
          subCategory: subcategory?.name ?? null,
          categoryReviewStatus: "assigned",
          categorySuggestion: category.name,
          subCategorySuggestion: subcategory?.name ?? null,
        },
      });

      await writeAdminAuditLog(req, {
        action: "catalog_product.bulk_category_assign",
        entityType: "product",
        details: {
          productIds,
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: subcategory?.id ?? null,
          subcategoryName: subcategory?.name ?? null,
          updated: result.count,
        },
      });

      return redirectWithResult(returnUrl, {
        success: "category",
        updated: result.count,
        skipped: productIds.length - result.count,
      });
    }

    if (action === "publish") {
      const result = await prisma.product.updateMany({
        where: {
          AND: [{ id: { in: productIds } }, readyToPublishProductWhere],
        },
        data: { showOnWebsite: true },
      });

      await writeAdminAuditLog(req, {
        action: "catalog_product.bulk_publish",
        entityType: "product",
        details: { productIds, updated: result.count },
      });

      return redirectWithResult(returnUrl, {
        success: "published",
        updated: result.count,
        skipped: productIds.length - result.count,
      });
    }

    if (action === "hide") {
      const result = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { showOnWebsite: false, isFeatured: false },
      });

      await writeAdminAuditLog(req, {
        action: "catalog_product.bulk_hide",
        entityType: "product",
        details: { productIds, updated: result.count },
      });

      return redirectWithResult(returnUrl, {
        success: "hidden",
        updated: result.count,
        skipped: productIds.length - result.count,
      });
    }

    return redirectWithResult(returnUrl, { error: "action" });
  } catch (error) {
    console.error("[AdminProductBulkError]", error);
    return redirectWithResult(returnUrl, { error: "operation" });
  }
}
