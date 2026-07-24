export type CsvRow = Record<string, string | undefined>;

export type LogoProductRow = {
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
  logoIsActive: boolean;
  vatRate: number | null;
  lastLogoModifiedAt: Date | null;
};

export type ProductImportResult = {
  imported: number;
  skipped: number;
};
