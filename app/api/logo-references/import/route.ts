import { prisma } from "@/lib/prisma";
import csv from "csv-parser";
import { Readable } from "stream";

type CsvRow = Record<string, string | undefined>;

const db = prisma as typeof prisma & {
  logoBrandReference: {
    upsert: (args: unknown) => Promise<unknown>;
  };
  logoUnitReference: {
    upsert: (args: unknown) => Promise<unknown>;
  };
};

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

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBooleanFromRecStatus(value: string) {
  return value !== "2";
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

async function importBrandReferences(rows: CsvRow[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const logicalRef = parseNumber(getCell(row, "LOGICALREF"));
    const name = getCell(row, "DESCR");

    if (!logicalRef || !name) {
      skipped += 1;
      continue;
    }

    await db.logoBrandReference.upsert({
      where: { logicalRef },
      update: {
        code: getCell(row, "CODE") || null,
        name,
        isActive: parseBooleanFromRecStatus(getCell(row, "RECSTATUS")),
      },
      create: {
        logicalRef,
        code: getCell(row, "CODE") || null,
        name,
        isActive: parseBooleanFromRecStatus(getCell(row, "RECSTATUS")),
      },
    });

    imported += 1;
  }

  return { imported, skipped };
}

async function importUnitSetHeaders(rows: CsvRow[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const unitSetRef = parseNumber(getCell(row, "LOGICALREF"));

    if (!unitSetRef) {
      skipped += 1;
      continue;
    }

    await db.logoUnitReference.upsert({
      where: { unitSetRef },
      update: {
        setCode: getCell(row, "CODE") || null,
        setName: getCell(row, "NAME") || null,
        isActive: parseBooleanFromRecStatus(getCell(row, "RECSTATUS")),
      },
      create: {
        unitSetRef,
        setCode: getCell(row, "CODE") || null,
        setName: getCell(row, "NAME") || null,
        mainUnitCode: null,
        mainUnitName: null,
        isActive: parseBooleanFromRecStatus(getCell(row, "RECSTATUS")),
      },
    });

    imported += 1;
  }

  return { imported, skipped };
}

async function importUnitSetLines(rows: CsvRow[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const unitSetRef = parseNumber(getCell(row, "UNITSETREF"));
    const isMainUnit = getCell(row, "MAINUNIT") === "1";

    if (!unitSetRef || !isMainUnit) {
      skipped += 1;
      continue;
    }

    await db.logoUnitReference.upsert({
      where: { unitSetRef },
      update: {
        mainUnitCode: getCell(row, "CODE") || null,
        mainUnitName: getCell(row, "NAME") || null,
      },
      create: {
        unitSetRef,
        setCode: null,
        setName: null,
        mainUnitCode: getCell(row, "CODE") || null,
        mainUnitName: getCell(row, "NAME") || null,
        isActive: true,
      },
    });

    imported += 1;
  }

  return { imported, skipped };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = String(formData.get("type") ?? "");

    if (!file) {
      return Response.json(
        { success: false, message: "Dosya bulunamadı." },
        { status: 400 },
      );
    }

    const rows = await readCsvRows(file);

    if (!rows.length) {
      return Response.json(
        { success: false, message: "CSV içinde okunabilir satır bulunamadı." },
        { status: 400 },
      );
    }

    const result =
      type === "brand"
        ? await importBrandReferences(rows)
        : type === "unitsetf"
          ? await importUnitSetHeaders(rows)
          : type === "unitsetl"
            ? await importUnitSetLines(rows)
            : null;

    if (!result) {
      return Response.json(
        { success: false, message: "Geçersiz referans tipi." },
        { status: 400 },
      );
    }

    return Response.json({
      success: true,
      count: result.imported,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("[LogoReferenceImportError]", error);
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Referans içe aktarımı sırasında hata oluştu.",
      },
      { status: 500 },
    );
  }
}
