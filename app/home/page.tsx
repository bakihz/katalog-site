import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ScrollReveal } from "@/components/catalog/scroll-reveal";
import { getHomepageSections } from "@/lib/homepageSections";
import {
  getHomepageProductShowcase,
  getPublicCategorySummaries,
} from "@/lib/publicCatalog";
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

const mosaicSizes = [
  "lg:row-span-2",
  "lg:row-span-3",
  "lg:row-span-2",
  "lg:row-span-3",
  "lg:row-span-3",
  "lg:row-span-2",
  "lg:row-span-3",
  "lg:row-span-2",
];

const mosaicFallbacks = [
  "from-[#173f32] to-[#2d6552]",
  "from-[#c2853e] to-[#e4aa62]",
  "from-[#6c382d] to-[#ad654d]",
  "from-[#273e35] to-[#557766]",
];

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

  const [siteSettings, homepageSections, categories, showcaseProducts] =
    await Promise.all([
      getSiteSettings(),
      getHomepageSections(),
      getPublicCategorySummaries(),
      getHomepageProductShowcase(),
    ]);
  const sectionMap = new Map(
    homepageSections.map((section) => [section.key, section]),
  );
  const heroSection = sectionMap.get("hero");
  const categorySection = sectionMap.get("categoryShowcase");
  const catalogSection = sectionMap.get("catalog");
  const configuredCategories = categories
    .filter((category) => category.showOnHomepage)
    .sort(
      (left, right) =>
        left.homepageSortOrder - right.homepageSortOrder ||
        left.name.localeCompare(right.name, "tr"),
    );
  const showcaseCategories =
    configuredCategories.length > 0
      ? configuredCategories.slice(0, 8)
      : categories.slice(0, 8);
  const featureCategory = showcaseCategories[0];
  const featureProduct = showcaseProducts[0];

  return (
    <CatalogShell>
      <div className="space-y-24 pb-6 sm:space-y-32">
        {categorySection?.isVisible !== false && (
          <section>
            <ScrollReveal>
              <div className="mb-7 flex flex-col gap-4 pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2853e]">
                    Ürün Grupları
                  </p>
                  <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    {categorySection?.contentTitle ?? "Kategorileri Keşfedin"}
                  </h1>
                </div>
                <Link
                  href="/katalog"
                  className="w-fit rounded-full border border-[#173f32]/20 bg-white/70 px-5 py-3 text-sm font-bold text-[#173f32] transition hover:bg-white"
                >
                  Tüm kategoriler →
                </Link>
              </div>
            </ScrollReveal>

            {showcaseCategories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[9rem] lg:grid-cols-4">
                {showcaseCategories.map((category, index) => (
                  <ScrollReveal
                    key={category.id}
                    className={`min-h-64 ${mosaicSizes[index % mosaicSizes.length]}`}
                    delay={(index % 4) * 80}
                  >
                    <Link
                      href={`/katalog/${category.slug}`}
                      className="group relative flex h-full min-h-64 overflow-hidden rounded-[1.75rem] bg-[#173f32] shadow-lg shadow-[#10231d]/10 lg:min-h-0"
                    >
                      {category.homepageImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.homepageImageUrl}
                          alt={category.homepageTitle ?? category.name}
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${
                            mosaicFallbacks[index % mosaicFallbacks.length]
                          }`}
                        >
                          <span className="absolute -right-3 -top-8 text-[11rem] font-black text-white/[0.08]">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071913]/95 via-[#10231d]/20 to-transparent" />
                      <div className="relative mt-auto w-full p-5 text-white sm:p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#efbc7c]">
                          {category._count.products} ürün
                        </p>
                        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                          {category.homepageTitle ?? category.name}
                        </h2>
                        {category.homepageDescription && (
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/70">
                            {category.homepageDescription}
                          </p>
                        )}
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[#173f32]/20 bg-white/45 px-6 py-16 text-center text-sm text-[#68746e]">
                Ana sayfa vitrini için yayınlanmış kategori bulunmuyor.
              </div>
            )}
          </section>
        )}

        {heroSection?.isVisible !== false && (
          <ScrollReveal>
            <section
              id="hakkimizda"
              className="grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-white/55 px-6 py-10 shadow-xl shadow-[#10231d]/5 sm:px-10 sm:py-14 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:px-16"
            >
              <div className="relative z-10 max-w-2xl py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2853e]">
                  {siteSettings.heroBadge}
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
                  {siteSettings.heroTitle}
                  <span className="block text-[#c2853e]">
                    {siteSettings.heroHighlight}
                  </span>
                </h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#5d6963]">
                  {siteSettings.heroDescription}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/katalog"
                    className="rounded-full bg-[#173f32] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#173f32]/15"
                  >
                    Kategorileri incele
                  </Link>
                  <Link
                    href="/urunler"
                    className="rounded-full border border-[#173f32]/20 px-6 py-3 text-sm font-bold text-[#173f32]"
                  >
                    Tüm ürünler
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[25rem] sm:min-h-[32rem]">
                <div className="absolute inset-y-0 right-0 w-[76%] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#173f32] to-[#315c4d]">
                  {featureCategory?.homepageImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featureCategory.homepageImageUrl}
                      alt={
                        featureCategory.homepageTitle ?? featureCategory.name
                      }
                      className="h-full w-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="flex h-full items-end p-8 text-8xl font-black text-white/[0.08]">
                      LALE
                    </div>
                  )}
                </div>
                <div className="absolute left-0 top-1/2 flex aspect-square w-[58%] -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-[0.8rem] border-[#f5f1e8] bg-[#c2853e] shadow-2xl shadow-[#10231d]/20">
                  {featureProduct?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featureProduct.imageUrl}
                      alt={featureProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-center text-2xl font-black text-white/90 sm:text-4xl">
                      Lale EDT
                    </span>
                  )}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {catalogSection?.isVisible !== false && (
          <section>
            <ScrollReveal>
              <div className="mb-7 flex flex-col gap-4  pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2853e]">
                    Ürün Vitrini
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    {catalogSection?.contentTitle ?? "Öne Çıkan Ürünler"}
                  </h2>
                  {catalogSection?.contentDescription && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68746e] sm:text-base">
                      {catalogSection.contentDescription}
                    </p>
                  )}
                </div>
                <Link
                  href="/urunler"
                  className="w-fit rounded-full bg-[#173f32] px-5 py-3 text-sm font-bold text-white"
                >
                  Tüm ürünleri gör →
                </Link>
              </div>
            </ScrollReveal>

            {showcaseProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {showcaseProducts.map((product, index) => (
                  <ScrollReveal key={product.id} delay={index * 90}>
                    <Link
                      href={`/urun/${product.slug}`}
                      className="group block h-full"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#e8ede8] shadow-sm">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-7xl font-black text-[#173f32]/10">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#c2853e] sm:text-xs">
                        {product.brand ?? product.catalogCategory?.name}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug sm:text-lg">
                        {product.name}
                      </h3>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[#173f32]/20 bg-white/45 px-6 py-16 text-center text-sm text-[#68746e]">
                Vitrinde gösterilecek yayınlanmış ürün bulunmuyor.
              </div>
            )}

            <ScrollReveal>
              <div className="mt-12 flex flex-col gap-5 border-t border-[#173f32]/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-3xl text-xl font-semibold leading-8 tracking-[-0.02em] sm:text-2xl">
                  Profesyonel mutfaklardan günlük ihtiyaçlara uzanan ürün
                  gruplarımızı tek katalogda keşfedin.
                </p>
                <Link
                  href="/katalog"
                  className="w-fit shrink-0 text-sm font-black text-[#173f32]"
                >
                  Kataloğa geç →
                </Link>
              </div>
            </ScrollReveal>
          </section>
        )}
      </div>
    </CatalogShell>
  );
}
