import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppButton, PageHeader } from "@/components/ui";

type AdminProductDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getDisplayName(product: {
  name: string;
  storeName: string | null;
  logoName: string | null;
  stockCode: string | null;
}) {
  return product.name || product.storeName || product.logoName || product.stockCode || "İsimsiz ürün";
}

function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const inputCls =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";
const textareaCls =
  "min-h-32 w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";
const labelCls = "block text-xs font-semibold text-[#68746e] mb-1";

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: AdminProductDetailPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  const query = await searchParams;
  const success = getFirstParam(query.success);
  const error = getFirstParam(query.error);
  const displayName = getDisplayName(product);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Katalog Ürünü"
        title={displayName}
        description="Logo'dan gelen ham veriyi müşteriye uygun katalog içeriğine dönüştür."
      />

      {(success || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error === "name"
            ? "Katalog adı zorunludur."
            : error
              ? "Ürün güncellenirken hata oluştu."
              : "Ürün bilgileri güncellendi."}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold">Katalog Bilgileri</h3>
          <p className="mt-1 text-sm text-[#68746e]">
            Bu alanlar müşterinin göreceği katalog içeriğini belirler. Logo
            importu bu alanları ezmez.
          </p>

          <form
            action={`/api/admin/products/${product.id}/update`}
            method="POST"
            className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <div>
              <label className={labelCls}>Katalog Adı *</label>
              <input
                name="name"
                required
                defaultValue={product.name}
                className={inputCls}
                placeholder={product.storeName || product.logoName || "Ürün adı"}
              />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input
                name="slug"
                defaultValue={product.slug}
                className={inputCls}
                placeholder="urun-linki"
              />
            </div>
            <div>
              <label className={labelCls}>Kategori</label>
              <input
                name="category"
                defaultValue={product.category ?? ""}
                className={inputCls}
                placeholder={product.logoCategoryRaw || "Kategori"}
              />
            </div>
            <div>
              <label className={labelCls}>Alt Kategori</label>
              <input
                name="subCategory"
                defaultValue={product.subCategory ?? ""}
                className={inputCls}
                placeholder={product.logoSubCategoryRaw || "Alt kategori"}
              />
            </div>
            <div>
              <label className={labelCls}>Marka</label>
              <input
                name="brand"
                defaultValue={product.brand ?? ""}
                className={inputCls}
                placeholder={
                  product.logoBrandRef
                    ? `Logo marka ref: ${product.logoBrandRef}`
                    : "Müşteriye görünecek marka"
                }
              />
            </div>
            <div>
              <label className={labelCls}>Web Stok Durumu</label>
              <select
                name="webStockStatus"
                defaultValue={product.webStockStatus ?? "Sorunuz"}
                className={inputCls}
              >
                <option value="Sorunuz">Sorunuz</option>
                <option value="Stokta var">Stokta var</option>
                <option value="Tedarik edilebilir">Tedarik edilebilir</option>
                <option value="Geçici olarak yok">Geçici olarak yok</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={labelCls}>Kısa Açıklama</label>
              <input
                name="shortDescription"
                defaultValue={product.shortDescription ?? ""}
                className={inputCls}
                placeholder="Liste kartında kullanılabilecek kısa açıklama"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelCls}>Detay Açıklama</label>
              <textarea
                name="description"
                defaultValue={product.description ?? ""}
                className={textareaCls}
                placeholder="Ürün detayında görünecek açıklama"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelCls}>Özellikler</label>
              <textarea
                name="features"
                defaultValue={product.features ?? ""}
                className={textareaCls}
                placeholder="Her satıra bir özellik yazılabilir"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelCls}>Görsel URL</label>
              <input
                name="imageUrl"
                defaultValue={product.imageUrl ?? ""}
                className={inputCls}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelCls}>Sıralama</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={product.sortOrder}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-3 rounded-2xl bg-[#f8f6f1] px-4 py-3 text-sm font-semibold text-[#17201c]">
                <input
                  name="showOnWebsite"
                  type="checkbox"
                  defaultChecked={product.showOnWebsite}
                  className="h-4 w-4 accent-[#173f32]"
                />
                Katalogda göster
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-[#f8f6f1] px-4 py-3 text-sm font-semibold text-[#17201c]">
                <input
                  name="isFeatured"
                  type="checkbox"
                  defaultChecked={product.isFeatured}
                  className="h-4 w-4 accent-[#173f32]"
                />
                Öne çıkan ürün
              </label>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <AppButton type="submit" size="lg">
                Kaydet
              </AppButton>
              <AppButton href="/admin/products" variant="outline" size="lg">
                Listeye Dön
              </AppButton>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Logo Ham Verisi</h3>
            <p className="mt-1 text-sm text-[#68746e]">
              Bu alanlar referans içindir. Katalog düzenlemesi Logo verisini
              değiştirmez.
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-[#68746e]">Stok Kodu</dt>
                <dd className="text-[#17201c]">{product.stockCode ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Logo Ürün Adı</dt>
                <dd className="text-[#17201c]">{product.logoName ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Mağaza Adı / NAME2</dt>
                <dd className="text-[#17201c]">{product.storeName ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Açıklama 2 / NAME3</dt>
                <dd className="text-[#17201c]">
                  {product.logoDescription2 ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Açıklama 3 / NAME4</dt>
                <dd className="text-[#17201c]">
                  {product.logoDescription3 ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Logo Kategori</dt>
                <dd className="text-[#17201c]">
                  {product.logoCategoryRaw ?? "-"} /{" "}
                  {product.logoSubCategoryRaw ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Logo Marka Ref</dt>
                <dd className="text-[#17201c]">
                  {product.logoBrandRef ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Logo Durumu</dt>
                <dd className="text-[#17201c]">
                  {product.logoIsActive ? "Aktif" : "Pasif"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">KDV</dt>
                <dd className="text-[#17201c]">
                  {product.vatRate ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Son Logo Güncelleme</dt>
                <dd className="text-[#17201c]">
                  {formatDate(product.lastLogoModifiedAt)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Son Import</dt>
                <dd className="text-[#17201c]">
                  {formatDate(product.lastLogoSyncAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-amber-900">
              Yayına Alma Notu
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Ürün yayına alınmadan önce katalog adı, kategori, açıklama ve
              görsel kontrol edilmelidir. Fiyat ve net stok şimdilik müşteriye
              gösterilmez.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
