import { AppButton, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getFirstSearchParam } from "@/lib/searchParams";

type AdminCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getAlertMessage(success?: string, error?: string) {
  if (error === "suggestion-not-found") return "Kategori önerisi bulunamadı veya daha önce işlendi.";
  if (error === "name") return "Kategori adı zorunludur.";
  if (error === "subcategory-name") return "Alt kategori adı zorunludur.";
  if (error === "duplicate") return "Bu isimde bir kategori zaten var.";
  if (error === "subcategory-duplicate") return "Bu kategoride aynı isimde bir alt kategori zaten var.";
  if (error === "not-found") return "Kategori kaydı bulunamadı.";
  if (success === "created") return "Kategori oluşturuldu.";
  if (success === "updated") return "Kategori güncellendi.";
  if (success === "subcategory-created") return "Alt kategori oluşturuldu.";
  if (success === "subcategory-updated") return "Alt kategori güncellendi.";
  if (success === "suggestion-approved") return "Kategori önerisi onaylandı ve ürüne bağlandı.";
  if (success === "suggestion-dismissed") return "Kategori önerisi inceleme listesinden kaldırıldı.";
  return "";
}

const inputClass =
  "w-full rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2.5 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const [categories, pendingSuggestions, params] = await Promise.all([
    prisma.catalogCategory.findMany({
      include: { subcategories: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: {
        categoryReviewStatus: "review",
        categorySuggestion: { not: null },
      },
      select: {
        id: true,
        name: true,
        stockCode: true,
        categorySuggestion: true,
        subCategorySuggestion: true,
        suggestionGeneratedAt: true,
      },
      orderBy: [{ suggestionGeneratedAt: "desc" }, { id: "desc" }],
      take: 100,
    }),
    searchParams,
  ]);
  const message = getAlertMessage(
    getFirstSearchParam(params.success),
    getFirstSearchParam(params.error),
  );
  const isError = Boolean(getFirstSearchParam(params.error));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Katalog Yapısı"
        title="Kategoriler"
        description="Müşteriye görünecek kategori ağacını buradan onaylayın. Ürünler yalnızca aktif kategori ve alt kategorilere bağlanır."
      />

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}

      <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#17201c]">AI kategori önerileri</h2>
            <p className="mt-1 text-sm leading-6 text-[#68746e]">
              Henüz kategori ağacında bulunmayan önerileri düzenleyip onayla. Onaylanan kayıt aktif kategoriye dönüşür ve ilgili ürüne bağlanır.
            </p>
          </div>
          <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            {pendingSuggestions.length} bekleyen
          </span>
        </div>

        {pendingSuggestions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-white/70 px-4 py-5 text-sm text-[#68746e]">
            İncelenecek yeni kategori önerisi yok.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {pendingSuggestions.map((suggestion) => (
              <article
                id={`suggestion-${suggestion.id}`}
                key={suggestion.id}
                className="scroll-mt-28 rounded-2xl border border-amber-200 bg-white p-4"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#17201c]">{suggestion.name}</p>
                    <p className="mt-1 text-xs text-[#68746e]">
                      Stok kodu: {suggestion.stockCode ?? "-"}
                    </p>
                  </div>
                  <AppButton href={`/admin/products/${suggestion.id}`} size="sm" variant="outline">
                    Ürünü Aç
                  </AppButton>
                </div>

                <form action={`/api/admin/categories/suggestions/${suggestion.id}/approve`} method="POST" className="space-y-3">
                  <label className="block text-xs font-semibold text-[#68746e]">
                    Ana kategori
                    <input
                      name="categoryName"
                      required
                      defaultValue={suggestion.categorySuggestion ?? ""}
                      className={`${inputClass} mt-1 bg-white`}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#68746e]">
                    Alt kategori
                    <input
                      name="subcategoryName"
                      defaultValue={suggestion.subCategorySuggestion ?? ""}
                      className={`${inputClass} mt-1 bg-white`}
                      placeholder="İsteğe bağlı"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <AppButton type="submit" size="sm">Düzenleyip Onayla</AppButton>
                  </div>
                </form>
                <form action={`/api/admin/categories/suggestions/${suggestion.id}/dismiss`} method="POST" className="mt-2">
                  <AppButton type="submit" size="sm" variant="outline">Şimdilik Kaldır</AppButton>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[#17201c]">Yeni ana kategori</h2>
        <p className="mt-1 text-sm text-[#68746e]">Önce ana kategoriyi oluşturun; alt kategorileri aşağıdan ekleyin.</p>
        <form action="/api/admin/categories/create" method="POST" className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_auto]">
          <input name="name" required className={inputClass} placeholder="Örn. Çikolata ve Kakao Ürünleri" />
          <input name="sortOrder" type="number" defaultValue="0" className={inputClass} aria-label="Sıralama" />
          <AppButton type="submit">Kategori Ekle</AppButton>
        </form>
      </section>

      {categories.length === 0 ? (
        <section className="rounded-[1.75rem] border border-dashed border-[#17201c]/20 bg-white p-8 text-sm text-[#68746e]">
          Henüz kategori yok. İlk kategoriyi yukarıdaki alandan oluşturabilirsin.
        </section>
      ) : (
        <div className="space-y-5">
          {categories.map((category) => (
            <section key={category.id} className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-5 shadow-sm sm:p-6">
              <form action={`/api/admin/categories/${category.id}/update`} method="POST" className="grid gap-3 lg:grid-cols-[1fr_120px_auto_auto] lg:items-end">
                <label className="block text-xs font-semibold text-[#68746e]">
                  Ana kategori
                  <input name="name" defaultValue={category.name} required className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-xs font-semibold text-[#68746e]">
                  Sıralama
                  <input name="sortOrder" type="number" defaultValue={category.sortOrder} className={`${inputClass} mt-1`} />
                </label>
                <label className="flex h-11 items-center gap-2 rounded-xl bg-[#f8f6f1] px-3 text-sm font-semibold text-[#17201c]">
                  <input name="isActive" type="checkbox" defaultChecked={category.isActive} className="accent-[#173f32]" />
                  Aktif
                </label>
                <AppButton type="submit" variant="outline">Kaydet</AppButton>
              </form>

              <div className="mt-5 border-t border-[#17201c]/10 pt-5">
                <h3 className="text-sm font-bold text-[#17201c]">Alt kategoriler</h3>
                <div className="mt-3 space-y-3">
                  {category.subcategories.map((subcategory) => (
                    <form key={subcategory.id} action={`/api/admin/categories/subcategories/${subcategory.id}/update`} method="POST" className="grid gap-3 rounded-2xl bg-[#f8f6f1] p-3 md:grid-cols-[1fr_110px_auto_auto] md:items-end">
                      <label className="block text-xs font-semibold text-[#68746e]">
                        Alt kategori
                        <input name="name" defaultValue={subcategory.name} required className={`${inputClass} mt-1 bg-white`} />
                      </label>
                      <label className="block text-xs font-semibold text-[#68746e]">
                        Sıralama
                        <input name="sortOrder" type="number" defaultValue={subcategory.sortOrder} className={`${inputClass} mt-1 bg-white`} />
                      </label>
                      <label className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-[#17201c]">
                        <input name="isActive" type="checkbox" defaultChecked={subcategory.isActive} className="accent-[#173f32]" />
                        Aktif
                      </label>
                      <AppButton type="submit" size="sm" variant="outline">Kaydet</AppButton>
                    </form>
                  ))}
                </div>
                <form action={`/api/admin/categories/${category.id}/subcategories/create`} method="POST" className="mt-4 grid gap-3 rounded-2xl border border-dashed border-[#17201c]/20 p-3 md:grid-cols-[1fr_110px_auto]">
                  <input name="name" required className={inputClass} placeholder="Yeni alt kategori" />
                  <input name="sortOrder" type="number" defaultValue="0" className={inputClass} aria-label="Alt kategori sıralaması" />
                  <AppButton type="submit" size="sm">Alt Kategori Ekle</AppButton>
                </form>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
