import type { Product } from "@prisma/client";
import { slugifyProductText } from "@/lib/adminProductText";
import {
  resolveLogoBrandName,
  resolveLogoUnitName,
} from "@/lib/logoReferences";
import { prisma } from "@/lib/prisma";
import {
  getInitialCatalogName,
  normalizeLogoProductRow,
} from "./logo-normalizer";
import type {
  CsvRow,
  LogoProductRow,
  ProductImportResult,
} from "./types";

type ResolvedLogoReferences = {
  logoBrandName: string | null;
  logoUnitName: string | null;
};

export async function importLogoProducts(
  rows: CsvRow[],
): Promise<ProductImportResult> {
  let imported = 0;
  let skipped = 0;
  const brandCache = new Map<number, string | null>();
  const unitCache = new Map<number, string | null>();

  for (const row of rows) {
    const item = normalizeLogoProductRow(row);

    if (!item) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.product.findUnique({
      where: { stockCode: item.stockCode },
    });

    // Logo'da pasif olan yeni ürünler kataloğa alınmaz. Daha önce aktarılmış
    // bir ürün pasife düşerse kayıt korunur, fakat katalog görünürlüğü kapanır.
    if (!item.logoIsActive && !existing) {
      skipped += 1;
      continue;
    }

    const references = await resolveReferences(item, brandCache, unitCache);

    if (existing) {
      await updateExistingProduct(existing, item, references);
    } else {
      await createProduct(item, references);
    }

    imported += 1;
  }

  return { imported, skipped };
}

async function resolveReferences(
  item: LogoProductRow,
  brandCache: Map<number, string | null>,
  unitCache: Map<number, string | null>,
): Promise<ResolvedLogoReferences> {
  const [logoBrandName, logoUnitName] = await Promise.all([
    resolveCachedReference(item.logoBrandRef, brandCache, resolveLogoBrandName),
    resolveCachedReference(
      item.logoUnitSetRef,
      unitCache,
      resolveLogoUnitName,
    ),
  ]);

  return { logoBrandName, logoUnitName };
}

async function resolveCachedReference(
  reference: number | null,
  cache: Map<number, string | null>,
  resolver: (reference: number | null) => Promise<string | null>,
) {
  if (!reference) {
    return null;
  }

  if (cache.has(reference)) {
    return cache.get(reference) ?? null;
  }

  const value = await resolver(reference);
  cache.set(reference, value);
  return value;
}

async function updateExistingProduct(
  existing: Product,
  item: LogoProductRow,
  references: ResolvedLogoReferences,
) {
  const shouldBeVisible =
    item.logoIsActive &&
    (existing.showOnWebsite || existing.publicationStatus === "published");

  await prisma.product.update({
    where: { id: existing.id },
    data: {
      ...getLogoProductData(item, references),
      showOnWebsite: shouldBeVisible,
      isFeatured: item.logoIsActive ? undefined : false,
      stockStatus: item.logoIsActive ? "Logo aktif" : "Logo pasif",
      lastLogoSyncAt: new Date(),
    } as Parameters<typeof prisma.product.update>[0]["data"],
  });
}

async function createProduct(
  item: LogoProductRow,
  references: ResolvedLogoReferences,
) {
  const catalogName = getInitialCatalogName(item);

  await prisma.product.create({
    data: {
      ...getLogoProductData(item, references),
      stockCode: item.stockCode,
      lastLogoSyncAt: new Date(),
      name: catalogName,
      slug: await createUniqueSlug(catalogName, item.stockCode),
      category: null,
      subCategory: null,
      brand: references.logoBrandName,
      unit: references.logoUnitName,
      showOnWebsite: false,
      publicationStatus: "draft",
      isFeatured: false,
      stockStatus: "Logo aktif",
      webStockStatus: "Sorunuz",
    } as Parameters<typeof prisma.product.create>[0]["data"],
  });
}

function getLogoProductData(
  item: LogoProductRow,
  references: ResolvedLogoReferences,
) {
  return {
    logoLogicalRef: item.logoLogicalRef,
    logoName: item.logoName,
    storeName: item.storeName,
    logoDescription2: item.logoDescription2,
    logoDescription3: item.logoDescription3,
    producerCode: item.producerCode,
    logoCategoryRaw: item.logoCategoryRaw,
    logoSubCategoryRaw: item.logoSubCategoryRaw,
    logoBrandRef: item.logoBrandRef,
    logoUnitSetRef: item.logoUnitSetRef,
    logoBrandName: references.logoBrandName,
    logoUnitName: references.logoUnitName,
    logoIsActive: item.logoIsActive,
    vatRate: item.vatRate,
    lastLogoModifiedAt: item.lastLogoModifiedAt,
  };
}

async function createUniqueSlug(baseText: string, stockCode: string) {
  const baseSlug =
    slugifyProductText(baseText) || slugifyProductText(stockCode) || "urun";
  let candidate = baseSlug;
  let suffix = 2;

  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
