import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isOllamaProductSuggestionEnabled } from "@/lib/ollamaProductSuggestions";
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

function getAlertMessage(success?: string, error?: string) {
  if (error === "name") return "Katalog adı zorunludur.";
  if (error === "suggestion") return "Ürün önerisi üretilirken hata oluştu.";
  if (error === "ollama-suggestion") return "Ollama önerisi alınamadı. Ollama çalışıyor mu ve env ayarları doğru mu kontrol edin.";
  if (error === "no-suggestion") return "Uygulanacak öneri bulunamadı.";
  if (error === "apply-suggestion") return "Ürün önerisi uygulanırken hata oluştu.";
  if (error) return "Ürün işlemi sırasında hata oluştu.";
  if (success === "suggestion-created") return "Ürün önerisi oluşturuldu.";
  if (success === "suggestion-applied") return "Ürün önerisi katalog bilgilerine uygulandı.";
  if (success) return "Ürün bilgileri güncellendi.";
  return "";
}

function formatConfidence(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `%${Math.round(value * 100)}`;
}

const inputCls =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";
const textareaCls =
  "min-h-32 w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";
const labelCls = "mb-1 block text-xs font-semibold text-[#68746e]";

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
  const alertMessage = getAlertMessage(success, error);
  const hasSuggestion = Boolean(product.suggestedName);
  const isOllamaEnabled = isOllamaProductSuggestionEnabled();
  const taxonomy = product as typeof product & {
    googleTaxonomyId?: string | null;
    googleTaxonomyPath?: string | null;
    suggestedGoogleTaxonomyId?: string | null;
    suggestedGoogleTaxonomyPath?: string | null;
    suggestedSourceUrls?: string | null;
    suggestedLearningNotes?: string | null;
    logoBrandName?: string | null;
    logoUnitName?: string | null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Katalog Ürünü"
        title={displayName}
        description="Logo'dan gelen ham veriyi müşteriye uygun katalog içeriğine dönüştür."
      />

      {alertMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {alertMessage}
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold">Katalog Önerisi</h3>
                <p className="mt-1 text-sm text-[#68746e]">
                  Kural tabanlı öneri hızlıdır. Ollama önerisi daha kaliteli
                  sonuç hedefler ve yine taslak olarak kaydedilir.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <form
                  action={`/api/admin/products/${product.id}/suggest`}
                  method="POST"
                >
                  <input type="hidden" name="engine" value="rule" />
                  <AppButton type="submit" variant="outline">
                    Kural Tabanlı Öner
                  </AppButton>
                </form>
                <form
                  action={`/api/admin/products/${product.id}/suggest`}
                  method="POST"
                >
                  <input type="hidden" name="engine" value="ollama" />
                  <AppButton
                    type="submit"
                    variant="secondary"
                    disabled={!isOllamaEnabled}
                    title={
                      isOllamaEnabled
                        ? "Ollama ile öneri üret"
                        : "OLLAMA_PRODUCT_SUGGESTIONS_ENABLED=true olmalı"
                    }
                  >
                    Ollama ile Öner
                  </AppButton>
                </form>
              </div>
            </div>

            <form
              action={`/api/admin/products/${product.id}/suggest`}
              method="POST"
              className="mt-4 rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] p-4"
            >
              <input type="hidden" name="engine" value="web-ollama" />
              <label className="block text-xs font-semibold text-[#68746e]">
                Web Kaynak URL&apos;leri
              </label>
              <textarea
                name="sourceUrls"
                rows={3}
                placeholder="Her satıra bir kaynak URL yaz. En fazla 3 URL okunur."
                className="mt-2 w-full rounded-2xl border border-[#17201c]/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-[#68746e]">
                  Kaynaklar öneriye yardımcı olur; kalıcı sözlüğe otomatik
                  yazılmaz.
                </p>
                <AppButton
                  type="submit"
                  variant="secondary"
                  disabled={!isOllamaEnabled}
                >
                  Web Destekli Öner
                </AppButton>
              </div>
            </form>

            <div className="mt-4 rounded-2xl bg-[#f8f6f1] px-4 py-3 text-xs text-[#68746e]">
              Ollama durumu:{" "}
              <span className="font-semibold text-[#17201c]">
                {isOllamaEnabled ? "Aktif" : "Kapalı"}
              </span>
              {!isOllamaEnabled &&
                " — kullanmak için .env içinde OLLAMA_PRODUCT_SUGGESTIONS_ENABLED=true yap."}
            </div>

            {hasSuggestion ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#f8f6f1] p-4 text-xs">
                  <div>
                    <span className="font-semibold text-[#68746e]">Kaynak</span>
                    <p className="mt-1 text-[#17201c]">
                      {product.suggestionSource ?? "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#68746e]">Güven</span>
                    <p className="mt-1 text-[#17201c]">
                      {formatConfidence(product.suggestionConfidence)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#68746e]">Durum</span>
                    <p className="mt-1 text-[#17201c]">
                      {product.suggestionStatus === "applied"
                        ? "Uygulandı"
                        : "Taslak"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#68746e]">Tarih</span>
                    <p className="mt-1 text-[#17201c]">
                      {formatDate(product.suggestionGeneratedAt)}
                    </p>
                  </div>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="rounded-xl bg-[#f8f6f1] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#68746e]">
                    Katalog Alanları
                  </div>
                  <div>
                    <dt className="font-semibold text-[#68746e]">Önerilen Ad</dt>
                    <dd className="text-[#17201c]">
                      {product.suggestedName ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#68746e]">Kategori</dt>
                    <dd className="text-[#17201c]">
                      {product.suggestedCategory ?? "-"} /{" "}
                      {product.suggestedSubCategory ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#68746e]">Marka</dt>
                    <dd className="text-[#17201c]">
                      {product.suggestedBrand ?? "-"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-[#f8f6f1] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#68746e]">
                    Google Taxonomy
                  </div>
                  <div>
                    <dt className="font-semibold text-[#68746e]">
                      Google Taxonomy
                    </dt>
                    <dd className="text-[#17201c]">
                      {taxonomy.suggestedGoogleTaxonomyPath
                        ? `${taxonomy.suggestedGoogleTaxonomyId ?? "-"} - ${
                            taxonomy.suggestedGoogleTaxonomyPath
                          }`
                        : "-"}
                    </dd>
                  </div>
                  {taxonomy.suggestedSourceUrls && (
                    <div>
                      <dt className="font-semibold text-[#68746e]">
                        Web Kaynakları
                      </dt>
                      <dd className="whitespace-pre-line break-words text-[#17201c]">
                        {taxonomy.suggestedSourceUrls}
                      </dd>
                    </div>
                  )}
                  {taxonomy.suggestedLearningNotes && (
                    <div>
                      <dt className="font-semibold text-[#68746e]">
                        Öğrenme Notları
                      </dt>
                      <dd className="whitespace-pre-line text-[#17201c]">
                        {taxonomy.suggestedLearningNotes}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-semibold text-[#68746e]">Kısa Açıklama</dt>
                    <dd className="text-[#17201c]">
                      {product.suggestedShortDescription ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#68746e]">Detay Açıklama</dt>
                    <dd className="whitespace-pre-line text-[#17201c]">
                      {product.suggestedDescription ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#68746e]">Özellikler</dt>
                    <dd className="whitespace-pre-line text-[#17201c]">
                      {product.suggestedFeatures ?? "-"}
                    </dd>
                  </div>
                </dl>

                <form
                  action={`/api/admin/products/${product.id}/apply-suggestion`}
                  method="POST"
                >
                  <AppButton type="submit" size="lg">
                    Öneriyi Katalog Bilgilerine Uygula
                  </AppButton>
                </form>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#17201c]/15 bg-[#f8f6f1] p-4 text-sm text-[#68746e]">
                Bu ürün için henüz öneri üretilmedi. Önce Logo ham verisini
                kontrol et, sonra öneri üretip çıkan taslağı elle onayla.
              </div>
            )}
          </section>

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
                <dt className="font-semibold text-[#68746e]">
                  Google Taxonomy
                </dt>
                <dd className="text-[#17201c]">
                  {taxonomy.googleTaxonomyPath
                    ? `${taxonomy.googleTaxonomyId ?? "-"} - ${
                        taxonomy.googleTaxonomyPath
                      }`
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Logo Marka Ref</dt>
                <dd className="text-[#17201c]">
                  {product.logoBrandRef ?? "-"}
                  {taxonomy.logoBrandName ? ` / ${taxonomy.logoBrandName}` : ""}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#68746e]">Logo Birim</dt>
                <dd className="text-[#17201c]">
                  {product.logoUnitSetRef ?? "-"}
                  {taxonomy.logoUnitName ? ` / ${taxonomy.logoUnitName}` : ""}
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
                <dd className="text-[#17201c]">{product.vatRate ?? "-"}</dd>
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
