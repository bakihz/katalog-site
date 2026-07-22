import { prisma } from "@/lib/prisma";
import { slugifyProductText } from "@/lib/adminProductText";

export function readCatalogText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim().replace(/\s+/g, " ");
}

export function readCatalogSortOrder(formData: FormData, key = "sortOrder") {
  const value = Number(readCatalogText(formData, key) || 0);
  return Number.isFinite(value) ? Math.trunc(value) : 0;
}

export async function createUniqueCategorySlug(name: string, exceptId?: number) {
  const base = slugifyProductText(name) || "kategori";
  let slug = base;
  let suffix = 2;

  while (
    await prisma.catalogCategory.findFirst({
      where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function createUniqueSubcategorySlug(
  categoryId: number,
  name: string,
  exceptId?: number,
) {
  const base = slugifyProductText(name) || "alt-kategori";
  let slug = base;
  let suffix = 2;

  while (
    await prisma.catalogSubcategory.findFirst({
      where: {
        categoryId,
        slug,
        ...(exceptId ? { NOT: { id: exceptId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
