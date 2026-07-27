import Link from "next/link";
import { CategoryShowcaseItem } from "@/components/admin/category-showcase-item";
import { HomepagePromoEditor } from "@/components/admin/homepage-promo-editor";
import { PageHeader } from "@/components/ui";
import { getHomepageSections } from "@/lib/homepageSections";
import { prisma } from "@/lib/prisma";
import { getFirstSearchParam } from "@/lib/searchParams";

type HomepageAdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomepageAdminPage({
  searchParams,
}: HomepageAdminPageProps) {
  const [sections, categories, params] = await Promise.all([
    getHomepageSections(),
    prisma.catalogCategory.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            showOnWebsite: true,
            logoIsActive: true,
            OR: [
              { catalogSubcategoryId: null },
              { catalogSubcategory: { isActive: true } },
            ],
          },
        },
      },
      select: {
        id: true,
        name: true,
        homepageTitle: true,
        homepageDescription: true,
        homepageImageUrl: true,
        homepageSortOrder: true,
        showOnHomepage: true,
        _count: {
          select: {
            products: {
              where: {
                showOnWebsite: true,
                logoIsActive: true,
                OR: [
                  { catalogSubcategoryId: null },
                  { catalogSubcategory: { isActive: true } },
                ],
              },
            },
          },
        },
      },
      orderBy: [
        { showOnHomepage: "desc" },
        { homepageSortOrder: "asc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    }),
    searchParams,
  ]);
  const success = getFirstSearchParam(params.success);
  const error = getFirstSearchParam(params.error);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Site Yönetimi"
        title="Ana Sayfa Yönetimi"
        description="Ana sayfadaki sabit bölümlerin görünürlüğünü ve sırasını tasarımı bozmadan yönetin."
        actions={
          <Link
            href="/home"
            target="_blank"
            className="inline-flex rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-2.5 text-sm font-bold text-[#173f32] transition hover:bg-white"
          >
            Ana Sayfayı Görüntüle ↗
          </Link>
        }
      />

      {(success || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error
            ? "Ana sayfa ayarları kaydedilemedi. Lütfen tekrar deneyin."
            : "Ana sayfa düzeni güncellendi."}
        </div>
      )}

      <form action="/api/admin/homepage" method="POST" className="space-y-4">
        {sections.map((section, index) => (
          <section
            key={section.key}
            className="grid gap-5 rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_13rem] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-[#edf1ec] text-sm font-black text-[#173f32]">
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold">{section.label}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    section.isVisible
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {section.isVisible ? "Yayında" : "Gizli"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#68746e]">
                {section.description}
              </p>
              {section.key === "promoHero" && (
                <HomepagePromoEditor
                  title={section.contentTitle}
                  description={section.contentDescription}
                  imageUrl={section.imageUrl}
                  mobileImageUrl={section.mobileImageUrl}
                  buttonLabel={section.buttonLabel}
                  buttonUrl={section.buttonUrl}
                />
              )}
              {section.key === "categoryShowcase" && (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-xs font-semibold text-[#68746e]">
                      Bölüm başlığı
                    </span>
                    <input
                      name="categoryShowcaseTitle"
                      required
                      maxLength={200}
                      defaultValue={section.contentTitle ?? ""}
                      className="w-full rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2.5 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold text-[#68746e]">
                      Bölüm açıklaması
                    </span>
                    <input
                      name="categoryShowcaseDescription"
                      maxLength={600}
                      defaultValue={section.contentDescription ?? ""}
                      className="w-full rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2.5 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                    />
                  </label>
                </div>
              )}
              {section.key === "hero" && (
                <Link
                  href="/admin/site-settings"
                  className="mt-3 inline-flex text-sm font-bold text-[#c2853e] transition hover:text-[#173f32]"
                >
                  Bölüm içeriğini düzenle →
                </Link>
              )}
            </div>

            <div className="grid gap-3 rounded-2xl bg-[#f8f6f1] p-4">
              <label>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[#68746e]">
                  Sıra
                </span>
                <select
                  name={`${section.key}Order`}
                  defaultValue={String(index + 1)}
                  className="w-full rounded-xl border border-[#17201c]/10 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#173f32]/40"
                >
                  {sections.map((_, orderIndex) => (
                    <option key={orderIndex} value={orderIndex + 1}>
                      {orderIndex + 1}. sıra
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-[#17201c]/10 bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  name={`${section.key}Visible`}
                  defaultChecked={section.isVisible}
                  className="size-4 accent-[#173f32]"
                />
                <span className="text-sm font-semibold">Bölümü göster</span>
              </label>
            </div>
          </section>
        ))}

        <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2853e]">
              Kategori Vitrini
            </p>
            <h3 className="mt-2 text-xl font-bold">Gösterilecek Kategoriler</h3>
            <p className="mt-2 text-sm leading-6 text-[#68746e]">
              Yalnızca aktif ve yayınlanmış ürünü bulunan kategoriler listelenir.
              Kart başlığı, görseli ve sırası buradan yönetilir.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#17201c]/15 bg-[#f8f6f1] px-4 py-6 text-sm text-[#68746e]">
              Vitrine eklenebilecek yayınlanmış ürünlü aktif kategori bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <CategoryShowcaseItem
                  key={category.id}
                  category={{
                    ...category,
                    publishedProductCount: category._count.products,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-2xl bg-[#10231d] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#10231d]/15 transition hover:bg-[#173f32]"
          >
            Ana Sayfayı Güncelle
          </button>
        </div>
      </form>
    </div>
  );
}
