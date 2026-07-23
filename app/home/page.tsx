import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { CategoryCard } from "@/components/catalog/category-card";
import { getHomepageSections } from "@/lib/homepageSections";
import { getPublicCategories } from "@/lib/publicCatalog";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.laleedt.com.tr"),
  title: "Lale EDT Gıda A.Ş. | Ürün Kataloğu",
  description:
    "Lale EDT Gıda ürün kataloğu. Ürün kategorilerini ve ürünlerimizi keşfedin.",
  alternates: { canonical: "/home" },
  openGraph: {
    title: "Lale EDT Gıda A.Ş. | Ürün Kataloğu",
    description: "Lale EDT Gıda ürün kataloğu.",
    url: "https://www.laleedt.com.tr/home",
    siteName: "Lale EDT Gıda",
    locale: "tr_TR",
    type: "website",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    kategori?: string;
    altKategori?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const legacyParams = await searchParams;

  if (legacyParams.kategori) {
    if (legacyParams.altKategori) {
      const params = new URLSearchParams();
      if (legacyParams.q) params.set("q", legacyParams.q);
      if (legacyParams.page) params.set("page", legacyParams.page);
      const suffix = params.toString();
      redirect(
        `/katalog/${encodeURIComponent(legacyParams.kategori)}/${encodeURIComponent(legacyParams.altKategori)}${suffix ? `?${suffix}` : ""}`,
      );
    }

    redirect(`/katalog/${encodeURIComponent(legacyParams.kategori)}`);
  }

  if (legacyParams.q || legacyParams.page) {
    const params = new URLSearchParams();
    if (legacyParams.q) params.set("q", legacyParams.q);
    if (legacyParams.page) params.set("page", legacyParams.page);
    redirect(`/urunler?${params.toString()}`);
  }

  const [siteSettings, homepageSections, categories] = await Promise.all([
    getSiteSettings(),
    getHomepageSections(),
    getPublicCategories(),
  ]);
  const sectionMap = new Map(
    homepageSections.map((section) => [section.key, section]),
  );
  const heroSection = sectionMap.get("hero");
  const categorySection = sectionMap.get("categoryShowcase");
  const catalogSection = sectionMap.get("catalog");
  const showcaseCategories = categories
    .filter((category) => category.showOnHomepage)
    .sort(
      (left, right) =>
        left.homepageSortOrder - right.homepageSortOrder ||
        left.name.localeCompare(right.name, "tr"),
    );

  return (
    <CatalogShell>
      <div className="flex flex-col">
        {heroSection?.isVisible !== false && (
          <section
            className="mb-14 rounded-[2.25rem] border border-white/70 bg-white/55 px-6 py-12 shadow-xl shadow-[#10231d]/5 backdrop-blur sm:px-10 sm:py-16"
            style={{ order: heroSection?.sortOrder ?? 10 }}
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#173f32]/8 px-4 py-2 text-sm font-semibold text-[#173f32]">
              <span className="size-2 rounded-full bg-[#c2853e]" />
              {siteSettings.heroBadge}
            </p>
            <h1 className="max-w-3xl text-[2.35rem] font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl">
              {siteSettings.heroTitle}
              <br />
              <span className="text-[#c2853e]">
                {siteSettings.heroHighlight}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d6963]">
              {siteSettings.heroDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/katalog"
                className="rounded-full bg-[#173f32] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d]"
              >
                Kategorilerden Seç →
              </Link>
              <Link
                href="/urunler"
                className="rounded-full border border-[#173f32]/15 bg-white/75 px-6 py-3 text-sm font-bold text-[#173f32] transition hover:bg-white"
              >
                Tüm Ürünleri Gör
              </Link>
            </div>
          </section>
        )}

        {categorySection?.isVisible === true &&
          showcaseCategories.length > 0 && (
            <section
              className="mb-14"
              style={{ order: categorySection.sortOrder }}
            >
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c2853e]">
                    Ürün Grupları
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                    {categorySection.contentTitle}
                  </h2>
                  {categorySection.contentDescription && (
                    <p className="mt-2 text-sm leading-6 text-[#68746e] sm:text-base">
                      {categorySection.contentDescription}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/katalog"
                    className="rounded-full border border-[#173f32]/15 bg-white/75 px-4 py-2.5 text-xs font-bold text-[#173f32] transition hover:bg-white"
                  >
                    Tüm Kategoriler
                  </Link>
                  <Link
                    href="/urunler"
                    className="rounded-full bg-[#173f32] px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Tüm Ürünler →
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {showcaseCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    href={`/katalog/${category.slug}`}
                    title={category.homepageTitle ?? category.name}
                    description={category.homepageDescription}
                    imageUrl={category.homepageImageUrl}
                    count={category._count.products}
                  />
                ))}
              </div>
            </section>
          )}

        {catalogSection?.isVisible !== false && (
          <section
            className="rounded-[2rem] bg-[#10231d] p-7 text-white shadow-xl sm:p-10"
            style={{ order: catalogSection?.sortOrder ?? 30 }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5b06e]">
                  Kataloga Hızlı Geçiş
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Aradığınız ürüne istediğiniz şekilde ulaşın.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Kategoriler arasında adım adım ilerleyin veya bütün ürünleri
                  tek listede görüntüleyin.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="/katalog"
                  className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#173f32]"
                >
                  Kategori Seç
                </Link>
                <Link
                  href="/urunler"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Tümünü Göster
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </CatalogShell>
  );
}
