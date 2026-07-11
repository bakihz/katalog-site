"use client";

import { useState } from "react";

type UploadState =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<UploadState>({
    type: "idle",
    message:
      "Logo'dan alınan ürün listesini CSV olarak seçtikten sonra içe aktarımı başlatabilirsin.",
  });

  async function handleUpload() {
    if (!file) {
      setStatus({
        type: "error",
        message: "Önce bir CSV dosyası seçmelisin.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "idle", message: "Dosya yükleniyor..." });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "İçe aktarım sırasında hata oluştu.");
      }

      setStatus({
        type: "success",
        message: `${data.count ?? 0} ürün içe aktarıldı. ${
          data.skipped ? `${data.skipped} satır atlandı.` : ""
        }`,
      });
      setFile(null);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "İçe aktarım sırasında hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2853e]">
          Katalog
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Logo Ürün Aktarımı
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68746e]">
          Bu ekran Logo&apos;dan gelen ham ürün bilgisini içe aktarır. Katalogda
          müşteriye görünecek ad, açıklama, kategori, marka ve görsel gibi
          panelde düzenlenen alanlar tekrar import sırasında ezilmez.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <label
            htmlFor="product-file"
            className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#17201c]/15 bg-[#f8f6f1] p-8 text-center transition hover:border-[#173f32]/35 hover:bg-white"
          >
            <span className="text-4xl" aria-hidden="true">
              📦
            </span>
            <span className="mt-4 text-lg font-bold">
              Logo CSV dosyasını seç
            </span>
            <span className="mt-2 max-w-md text-sm leading-6 text-[#68746e]">
              Şimdilik CSV desteklenir. Excel dosyasını Logo/Excel üzerinden
              CSV olarak kaydedip yükleyebilirsin.
            </span>
            <span className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#173f32] shadow-sm">
              {file ? file.name : "Dosya seçilmedi"}
            </span>
          </label>

          <input
            id="product-file"
            type="file"
            accept=".csv"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] || null;
              setFile(selectedFile);
              setStatus({
                type: "idle",
                message: selectedFile
                  ? `${selectedFile.name} seçildi.`
                  : "Logo'dan alınan ürün listesini CSV olarak seçtikten sonra içe aktarımı başlatabilirsin.",
              });
            }}
            className="sr-only"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-[#10231d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173f32] disabled:cursor-not-allowed disabled:bg-[#d8d2c6] disabled:text-[#7a867f]"
          >
            {loading ? "Yükleniyor..." : "İçe Aktar"}
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Aktarım Durumu</h3>
            <div
              className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : status.type === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-[#f8f6f1] text-[#68746e]"
              }`}
            >
              {status.message}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-amber-900">
              Önemli Kural
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Import edilen yeni ürünler varsayılan olarak katalogda gizli
              gelir. Ürün yayına alınmadan önce admin panelden adı, açıklaması,
              kategorisi ve görseli kontrol edilmelidir.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Beklenen Logo Kolonları</h3>
            <p className="mt-2 text-sm leading-6 text-[#68746e]">
              Minimum: CODE, NAME, ACTIVE, LOGICALREF. Ek olarak NAME2, NAME3,
              NAME4, SPECODE2, SPECODE3, MARKREF, UNITSETREF, VAT ve
              CAPIBLOCK_MODIFIEDDATE okunur.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
