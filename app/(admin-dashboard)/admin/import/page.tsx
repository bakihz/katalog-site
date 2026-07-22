"use client";

import { useState } from "react";

type UploadState =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceType, setReferenceType] = useState("brand");
  const [loading, setLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [status, setStatus] = useState<UploadState>({
    type: "idle",
    message:
      "Logo'dan alınan ürün listesini CSV olarak seçtikten sonra içe aktarımı başlatabilirsin.",
  });
  const [referenceStatus, setReferenceStatus] = useState<UploadState>({
    type: "idle",
    message:
      "Marka ve birim referans tablolarını CSV olarak yükleyebilirsin. Önce marka, sonra unitsetf, sonra unitsetl yüklemek en sağlıklısıdır.",
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

  async function handleReferenceUpload() {
    if (!referenceFile) {
      setReferenceStatus({
        type: "error",
        message: "Önce bir referans CSV dosyası seçmelisin.",
      });
      return;
    }

    setReferenceLoading(true);
    setReferenceStatus({ type: "idle", message: "Referans dosyası yükleniyor..." });

    try {
      const formData = new FormData();
      formData.append("file", referenceFile);
      formData.append("type", referenceType);

      const res = await fetch("/api/logo-references/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Referans içe aktarımı sırasında hata oluştu.",
        );
      }

      setReferenceStatus({
        type: "success",
        message: `${data.count ?? 0} referans kaydı içe aktarıldı. ${
          data.skipped ? `${data.skipped} satır atlandı.` : ""
        }`,
      });
      setReferenceFile(null);
    } catch (error) {
      setReferenceStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Referans içe aktarımı sırasında hata oluştu.",
      });
    } finally {
      setReferenceLoading(false);
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2853e]">
            Logo Referansları
          </p>
          <h3 className="mt-2 text-2xl font-bold">Marka ve Birim Aktarımı</h3>
          <p className="mt-2 text-sm leading-6 text-[#68746e]">
            Bu alan markref, unitsetf ve unitsetl dosyalarını referans sözlüğü
            olarak içe aktarır. Ürün importu sonrasında MARKREF ve UNITSETREF
            değerleri bu sözlüklerle okunabilir marka/birim adına çevrilir.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.7fr_1fr]">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#68746e]">
                Referans Tipi
              </span>
              <select
                value={referenceType}
                onChange={(event) => setReferenceType(event.target.value)}
                className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
              >
                <option value="brand">markref / Marka</option>
                <option value="unitsetf">unitsetf / Birim Setleri</option>
                <option value="unitsetl">unitsetl / Birim Satırları</option>
              </select>
            </label>

            <label
              htmlFor="reference-file"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-[#17201c]/15 bg-[#f8f6f1] px-4 py-3 text-sm transition hover:border-[#173f32]/35 hover:bg-white"
            >
              <span className="font-semibold text-[#173f32]">
                {referenceFile ? referenceFile.name : "Referans CSV seç"}
              </span>
              <span aria-hidden="true">📄</span>
            </label>
          </div>

          <input
            id="reference-file"
            type="file"
            accept=".csv"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] || null;
              setReferenceFile(selectedFile);
              setReferenceStatus({
                type: "idle",
                message: selectedFile
                  ? `${selectedFile.name} seçildi.`
                  : "Marka ve birim referans tablolarını CSV olarak yükleyebilirsin.",
              });
            }}
            className="sr-only"
          />

          <button
            onClick={handleReferenceUpload}
            disabled={referenceLoading}
            className="mt-5 w-full rounded-2xl bg-[#10231d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173f32] disabled:cursor-not-allowed disabled:bg-[#d8d2c6] disabled:text-[#7a867f]"
          >
            {referenceLoading ? "Yükleniyor..." : "Referansı İçeri Aktar"}
          </button>
        </div>

        <aside className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold">Referans Aktarım Durumu</h3>
          <div
            className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
              referenceStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800"
                : referenceStatus.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-[#f8f6f1] text-[#68746e]"
            }`}
          >
            {referenceStatus.message}
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Tavsiye edilen sıra: önce <strong>markref</strong>, sonra{" "}
            <strong>unitsetf</strong>, en son <strong>unitsetl</strong>.
            Ardından ürün CSV importu çalıştırılmalıdır.
          </div>
        </aside>
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
