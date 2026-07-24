import { getCsvCell } from "./csv-parser";
import type { CsvRow, LogoProductRow } from "./types";

export function normalizeLogoProductRow(
  row: CsvRow,
): LogoProductRow | null {
  const stockCode = getCsvCell(row, "CODE");
  const logoName = getCsvCell(row, "NAME");

  if (!stockCode || !logoName || stockCode === "ÿ") {
    return null;
  }

  return {
    logoLogicalRef: parseNumber(getCsvCell(row, "LOGICALREF")),
    stockCode,
    logoName,
    storeName: getNullableCell(row, "NAME2"),
    logoDescription2: getNullableCell(row, "NAME3"),
    logoDescription3: getNullableCell(row, "NAME4"),
    producerCode: getNullableCell(row, "PRODUCERCODE"),
    logoCategoryRaw: getNullableCell(row, "SPECODE2"),
    logoSubCategoryRaw: getNullableCell(row, "SPECODE3"),
    logoBrandRef: parseNumber(getCsvCell(row, "MARKREF")),
    logoUnitSetRef: parseNumber(getCsvCell(row, "UNITSETREF")),
    logoIsActive: getCsvCell(row, "ACTIVE") !== "1",
    vatRate: parseNumber(getCsvCell(row, "VAT")),
    lastLogoModifiedAt: parseDate(
      getCsvCell(row, "CAPIBLOCK_MODIFIEDDATE"),
    ),
  };
}

export function getInitialCatalogName(item: LogoProductRow) {
  return item.storeName || item.logoName || item.stockCode;
}

function getNullableCell(row: CsvRow, key: string) {
  return getCsvCell(row, key) || null;
}

function parseNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
