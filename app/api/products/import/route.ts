import { prisma } from "@/lib/prisma";
import {
  resolveLogoBrandName,
  resolveLogoUnitName,
} from "@/lib/logoReferences";
import csv from "csv-parser";
import { Readable } from "stream";

type CsvRow = Record<string, string | undefined>;

type LogoProductRow = {
  logoLogicalRef: number | null;
  stockCode: string;
  logoName: string;
  storeName: string | null;
  logoDescription2: string | null;
  logoDescription3: string | null;
  producerCode: string | null;
  logoCategoryRaw: string | null;
  logoSubCategoryRaw: string | null;
  logoBrandRef: number | null;
  logoUnitSetRef: number | null;
  logoBrandName: string | null;
  logoUnitName: string | null;
  logoIsActive: boolean;
  vatRate: number | null;
  lastLogoModifiedAt: Date | null;
};

const logoImportColumns = [
  "LOGICALREF",
  "ACTIVE",
  "CODE",
  "NAME",
  "NAME2",
  "NAME3",
  "NAME4",
  "PRODUCERCODE",
  "SPECODE2",
  "SPECODE3",
  "MARKREF",
  "UNITSETREF",
  "VAT",
  "CAPIBLOCK_MODIFIEDDATE",
];

function normalizeHeader(key: string) {
  return key.trim().replace(/^\uFEFF/, "").replace(/^"|"$/g, "").toUpperCase();
}

function normalizeCsvRow(row: CsvRow): CsvRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
  );
}

function getCell(row: CsvRow, key: string) {
  return String(row[normalizeHeader(key)] ?? "").trim();
}

function detectSeparator(buffer: Buffer) {
  const firstLine =
    buffer.toString("utf8", 0, Math.min(buffer.length, 4096)).split(/\r?\n/)[0] ??
    "";
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;

  return semicolonCount > commaCount ? ";" : ",";
}

function parseNumber(value: string) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function slugify(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getImportMode(row: CsvRow) {
  const upperKeys = Object.keys(row).map((key) => normalizeHeader(key));
  const matchedLogoColumns = logoImportColumns.filter((column) =>
    upperKeys.includes(column),
  );

  return matchedLogoColumns.length >= 4 ? "logo" : "legacy";
}

function normalizeLogoRow(row: CsvRow): LogoProductRow | null {
  const stockCode = getCell(row, "CODE");
  const logoName = getCell(row, "NAME");

  if (!stockCode || !logoName || stockCode === "ÿ") {
    return null;
  }

  const active = getCell(row, "ACTIVE");

  return {
    logoLogicalRef: parseNumber(getCell(row, "LOGICALREF")),
    stockCode,
    logoName,
    storeName: getCell(row, "NAME2") || null,
    logoDescription2: getCell(row, "NAME3") || null,
    logoDescription3: getCell(row, "NAME4") || null,
    producerCode: getCell(row, "PRODUCERCODE") || null,
    logoCategoryRaw: getCell(row, "SPECODE2") || null,
    logoSubCategoryRaw: getCell(row, "SPECODE3") || null,
    logoBrandRef: parseNumber(getCell(row, "MARKREF")),
    logoUnitSetRef: parseNumber(getCell(row, "UNITSETREF")),
    logoBrandName: null,
    logoUnitName: null,
    logoIsActive: active !== "1",
    vatRate: parseNumber(getCell(row, "VAT")),
    lastLogoModifiedAt: parseDate(getCell(row, "CAPIBLOCK_MODIFIEDDATE")),
  };
}

function getInitialCatalogName(item: LogoProductRow) {
  return item.storeName || item.logoName || item.stockCode;
}

async function createUniqueSlug(baseText: string, stockCode: string) {
  const baseSlug = slugify(baseText) || slugify(stockCode) || "urun";
  let candidate = baseSlug;
  let suffix = 2;

  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function importLogoProducts(rows: CsvRow[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const item = normalizeLogoRow(row);

    if (!item) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.product.findUnique({
      where: { stockCode: item.stockCode },
    });

    // Logo'da pasif olan yeni kayıtlar katalog veritabanına hiç alınmaz.
    // Daha önce içe aktarılmış bir ürün sonradan pasife düşmüşse mevcut kayıt
    // aşağıdaki güncelleme akışından geçerek katalogdan kaldırılır.
    if (!item.logoIsActive && !existing) {
      skipped += 1;
      continue;
    }

    const logoBrandName = await resolveLogoBrandName(item.logoBrandRef);
    const logoUnitName = await resolveLogoUnitName(item.logoUnitSetRef);

    if (existing) {
      const shouldBeVisible =
        item.logoIsActive &&
        (existing.showOnWebsite ||
          existing.publicationStatus === "published");

      await prisma.product.update({
        where: { id: existing.id },
        data: {
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
          logoBrandName,
          logoUnitName,
          logoIsActive: item.logoIsActive,
          showOnWebsite: shouldBeVisible,
          isFeatured: item.logoIsActive ? undefined : false,
          stockStatus: item.logoIsActive ? "Logo aktif" : "Logo pasif",
          vatRate: item.vatRate,
          lastLogoModifiedAt: item.lastLogoModifiedAt,
          lastLogoSyncAt: new Date(),
        } as Parameters<typeof prisma.product.update>[0]["data"],
      });
    } else {
      const catalogName = getInitialCatalogName(item);

      await prisma.product.create({
        data: {
          logoLogicalRef: item.logoLogicalRef,
          stockCode: item.stockCode,
          logoName: item.logoName,
          storeName: item.storeName,
          logoDescription2: item.logoDescription2,
          logoDescription3: item.logoDescription3,
          producerCode: item.producerCode,
          logoCategoryRaw: item.logoCategoryRaw,
          logoSubCategoryRaw: item.logoSubCategoryRaw,
          logoBrandRef: item.logoBrandRef,
          logoUnitSetRef: item.logoUnitSetRef,
          logoBrandName,
          logoUnitName,
          logoIsActive: item.logoIsActive,
          vatRate: item.vatRate,
          lastLogoModifiedAt: item.lastLogoModifiedAt,
          lastLogoSyncAt: new Date(),
          name: catalogName,
          slug: await createUniqueSlug(catalogName, item.stockCode),
          category: null,
          subCategory: null,
          brand: logoBrandName,
          unit: logoUnitName,
          showOnWebsite: false,
          publicationStatus: "draft",
          isFeatured: false,
          stockStatus: item.logoIsActive ? "Logo aktif" : "Logo pasif",
          webStockStatus: "Sorunuz",
        } as Parameters<typeof prisma.product.create>[0]["data"],
      });
    }

    imported += 1;
  }

  return { imported, skipped };
}

async function readCsvRows(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const separator = detectSeparator(buffer);
  const rows: CsvRow[] = [];

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(
        csv({
          separator,
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on("data", (data: CsvRow) => {
        rows.push(normalizeCsvRow(data));
      })
      .on("end", resolve)
      .on("error", reject);
  });

  return rows;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { success: false, message: "Dosya bulunamadı." },
        { status: 400 },
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return Response.json(
        {
          success: false,
          message:
            "Şimdilik yalnızca CSV destekleniyor. Excel dosyasını CSV olarak kaydedip tekrar yükleyin.",
        },
        { status: 400 },
      );
    }

    const rows = await readCsvRows(file);

    if (rows.length === 0) {
      return Response.json(
        { success: false, message: "Dosyada okunacak satır bulunamadı." },
        { status: 400 },
      );
    }

    if (getImportMode(rows[0]) !== "logo") {
      const detectedColumns = Object.keys(rows[0]).slice(0, 12).join(", ");

      return Response.json(
        {
          success: false,
          message: `Bu ekran artık Logo ürün CSV formatını bekliyor. En az CODE, NAME, ACTIVE ve LOGICALREF kolonları olmalı. Algılanan kolonlar: ${detectedColumns || "yok"}`,
        },
        { status: 400 },
      );
    }

    const result = await importLogoProducts(rows);

    return Response.json({
      success: true,
      count: result.imported,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("[ProductImportError]", error);

    return Response.json(
      {
        success: false,
        message: "İçe aktarım sırasında hata oluştu.",
      },
      { status: 500 },
    );
  }
}
