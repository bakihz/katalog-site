import csv from "csv-parser";
import { Readable } from "stream";
import type { CsvRow } from "./types";

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

export function normalizeCsvHeader(key: string) {
  return key.trim().replace(/^\uFEFF/, "").replace(/^"|"$/g, "").toUpperCase();
}

export function getCsvCell(row: CsvRow, key: string) {
  return String(row[normalizeCsvHeader(key)] ?? "").trim();
}

export function getDetectedCsvColumns(row: CsvRow) {
  return Object.keys(row).map(normalizeCsvHeader);
}

export function isLogoProductCsv(row: CsvRow) {
  const columns = getDetectedCsvColumns(row);
  const matchedColumnCount = logoImportColumns.filter((column) =>
    columns.includes(column),
  ).length;

  return matchedColumnCount >= 4;
}

export async function readCsvRows(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const separator = detectSeparator(buffer);
  const rows: CsvRow[] = [];

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(
        csv({
          separator,
          mapHeaders: ({ header }) => normalizeCsvHeader(header),
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

function normalizeCsvRow(row: CsvRow): CsvRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      normalizeCsvHeader(key),
      value,
    ]),
  );
}

function detectSeparator(buffer: Buffer) {
  const firstLine =
    buffer.toString("utf8", 0, Math.min(buffer.length, 4096)).split(/\r?\n/)[0] ??
    "";
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;

  return semicolonCount > commaCount ? ";" : ",";
}
