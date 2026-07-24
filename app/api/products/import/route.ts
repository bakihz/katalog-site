import {
  getDetectedCsvColumns,
  isLogoProductCsv,
  readCsvRows,
} from "@/lib/product-import/csv-parser";
import { importLogoProducts } from "@/lib/product-import/logo-product-importer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return importError("Dosya bulunamadı.");
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return importError(
        "Şimdilik yalnızca CSV destekleniyor. Excel dosyasını CSV olarak kaydedip tekrar yükleyin.",
      );
    }

    const rows = await readCsvRows(file);

    if (rows.length === 0) {
      return importError("Dosyada okunacak satır bulunamadı.");
    }

    if (!isLogoProductCsv(rows[0])) {
      const detectedColumns = getDetectedCsvColumns(rows[0])
        .slice(0, 12)
        .join(", ");

      return importError(
        `Bu ekran artık Logo ürün CSV formatını bekliyor. En az CODE, NAME, ACTIVE ve LOGICALREF kolonları olmalı. Algılanan kolonlar: ${detectedColumns || "yok"}`,
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

function importError(message: string) {
  return Response.json({ success: false, message }, { status: 400 });
}
