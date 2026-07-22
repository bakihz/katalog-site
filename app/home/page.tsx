import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { getHomepageSections } from "@/lib/homepageSections";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, getTelephoneHref } from "@/lib/siteSettings";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.laleedt.com.tr"),
  title: "Lale EDT Gıda A.Ş. | Ürün Kataloğu",
  description:
    "Lale EDT Gıda ürün kataloğu. Gıda ve tarım ürünlerini keşfedin.",
  applicationName: "Lale EDT Gıda",
  openGraph: {
    title: "Lale EDT Gıda A.Ş. | Ürün Kataloğu",
    description: "Lale EDT Gıda ürün kataloğu.",
    url: "https://www.laleedt.com.tr/home",
    siteName: "Lale EDT Gıda",
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

function buildCatalogHref({
  category,
  subcategory,
  query,
  page,
}: {
  category?: string;
  subcategory?: string;
  query?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (category) params.set("kategori", category);
  if (subcategory) params.set("altKategori", subcategory);
  if (query) params.set("q", query);
  if (page && page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString ? `/home?${queryString}` : "/home";
}

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
  const {
    kategori: requestedCategory,
    altKategori: requestedSubcategory,
    q: requestedQuery,
    page: requestedPage,
  } = await searchParams;
  const categorySlug = requestedCategory?.trim().slice(0, 120) || undefined;
  const subcategorySlug =
    requestedSubcategory?.trim().slice(0, 120) || undefined;
  const q = requestedQuery?.trim().slice(0, 100) || undefined;
  const parsedPage = Number(requestedPage ?? "1");
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [cookieStore, categories, siteSettings, homepageSections] =
    await Promise.all([
    cookies(),
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
        slug: true,
        showOnHomepage: true,
        homepageSortOrder: true,
        homepageTitle: true,
        homepageDescription: true,
        homepageImageUrl: true,
        subcategories: {
          where: {
            isActive: true,
            products: {
              some: { showOnWebsite: true, logoIsActive: true },
            },
          },
          select: { id: true, name: true, slug: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getSiteSettings(),
    getHomepageSections(),
  ]);
  const homepageSectionMap = new Map(
    homepageSections.map((section) => [section.key, section]),
  );
  const heroSection = homepageSectionMap.get("hero");
  const categoryShowcaseSection = homepageSectionMap.get("categoryShowcase");
  const catalogSection = homepageSectionMap.get("catalog");
  const showcaseCategories = categories
    .filter((category) => category.showOnHomepage)
    .sort(
      (left, right) =>
        left.homepageSortOrder - right.homepageSortOrder ||
        left.name.localeCompare(right.name, "tr"),
    );
  const catalogPageSize = siteSettings.catalogPageSize;
  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : undefined;
  const selectedSubcategory = selectedCategory && subcategorySlug
    ? selectedCategory.subcategories.find(
        (subcategory) => subcategory.slug === subcategorySlug,
      )
    : undefined;
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );
  const agent = agentId
    ? await prisma.user.findUnique({
        where: { id: agentId },
        select: { isActive: true, name: true },
      })
    : null;
  const isAgentLoggedIn = Boolean(agent?.isActive);
  const agentLoginHref = isAgentLoggedIn ? "/panel" : "/giris";

  const where: Prisma.ProductWhereInput = {
    showOnWebsite: true,
    logoIsActive: true,
    catalogCategory: { isActive: true },
    AND: [
      {
        OR: [
          { catalogSubcategoryId: null },
          { catalogSubcategory: { isActive: true } },
        ],
      },
      ...(categorySlug
        ? [{ catalogCategoryId: selectedCategory?.id ?? -1 }]
        : []),
      ...(subcategorySlug
        ? [{ catalogSubcategoryId: selectedSubcategory?.id ?? -1 }]
        : []),
      ...(q
        ? [
            {
              OR: [
                { name: { contains: q } },
                { brand: { contains: q } },
              ],
            },
          ]
        : []),
    ],
  };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        catalogCategory: { select: { name: true, slug: true } },
        catalogSubcategory: { select: { name: true, slug: true } },
        imageUrl: true,
        isFeatured: true,
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      skip: (currentPage - 1) * catalogPageSize,
      take: catalogPageSize,
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProducts / catalogPageSize));
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#17201c]">
      {/* Subtle dot pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-[#17201c]/10 bg-[#f4f1ea]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-10 lg:px-16">
          <Link href="/home" className="flex min-w-0 items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl shadow-md">
              <Image
                src="/logo.svg"
                alt="Lale EDT logo"
                fill
                priority
                sizes="44px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight tracking-tight sm:text-base">
                {siteSettings.companyName}
              </p>
              <p className="hidden text-[11px] uppercase tracking-[0.22em] text-[#63736b] sm:block">
                Ürün kataloğu
              </p>
            </div>
          </Link>

          {siteSettings.showAgentLogin && (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={agentLoginHref}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#173f32] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d] sm:px-4 sm:tracking-[0.14em]"
            >
              {isAgentLoggedIn ? (
                <>
                  <span className="hidden max-w-36 truncate normal-case tracking-normal sm:inline">
                    {agent?.name}
                  </span>
                  <span className="hidden opacity-60 sm:inline">•</span>
                  <span>Panele Git</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Giriş</span>
                  <span className="hidden sm:inline">Temsilci Girişi</span>
                </>
              )}
            </Link>
          </div>
          )}
        </div>
      </header>

      <main className="relative mx-auto flex max-w-7xl flex-col px-4 py-10 sm:px-10 lg:px-16">
        {/* ── HERO ── */}
        {heroSection?.isVisible !== false && (
        <section className="mb-12" style={{ order: heroSection?.sortOrder ?? 10 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#173f32]/8 px-4 py-2 text-sm font-semibold text-[#173f32]">
            <span className="size-2 rounded-full bg-[#c2853e]" />
            {siteSettings.heroBadge}
          </p>
          <h1 className="max-w-2xl text-[2rem] font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
            {siteSettings.heroTitle}
            <br />
            <span className="text-[#c2853e]">{siteSettings.heroHighlight}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#5d6963]">
            {siteSettings.heroDescription}
          </p>
        </section>
        )}

        {categoryShowcaseSection?.isVisible === true &&
          showcaseCategories.length > 0 && (
          <section
            className="mb-14"
            style={{ order: categoryShowcaseSection?.sortOrder ?? 20 }}
          >
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c2853e]">
                  Ürün Grupları
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                  {categoryShowcaseSection.contentTitle}
                </h2>
                {categoryShowcaseSection.contentDescription && (
                  <p className="mt-2 text-sm leading-6 text-[#68746e] sm:text-base">
                    {categoryShowcaseSection.contentDescription}
                  </p>
                )}
              </div>
              <Link
                href="/home"
                className="hidden shrink-0 text-sm font-bold text-[#173f32] transition hover:text-[#c2853e] sm:inline-flex"
              >
                Tüm kategoriler →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showcaseCategories.map((category) => (
                <Link
                  key={category.id}
                  href={buildCatalogHref({ category: category.slug })}
                  className="group relative min-h-64 overflow-hidden rounded-[1.75rem] bg-[#173f32] shadow-lg shadow-[#10231d]/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {category.homepageImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.homepageImageUrl}
                      alt={category.homepageTitle ?? category.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(194,133,62,0.55),transparent_38%),linear-gradient(135deg,#173f32,#0d2920)]">
                      <span className="absolute right-5 top-1 text-[8rem] font-black leading-none text-white/[0.06]">
                        {(category.homepageTitle ?? category.name).charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081b15]/95 via-[#10231d]/30 to-transparent" />
                  <div className="relative flex min-h-64 flex-col justify-end p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5b06e]">
                      Kategori
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.025em]">
                      {category.homepageTitle ?? category.name}
                    </h3>
                    {category.homepageDescription && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                        {category.homepageDescription}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                      Ürünleri incele
                      <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {catalogSection?.isVisible !== false && (
        <div style={{ order: catalogSection?.sortOrder ?? 20 }}>
        {/* ── SEARCH + FILTERS ── */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <form method="GET" className="relative w-full sm:max-w-xs">
            {selectedCategory && (
              <input
                type="hidden"
                name="kategori"
                value={selectedCategory.slug}
              />
            )}
            {selectedSubcategory && (
              <input
                type="hidden"
                name="altKategori"
                value={selectedSubcategory.slug}
              />
            )}
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89938e]">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Ürün veya marka ara…"
              className="w-full rounded-full border border-[#17201c]/15 bg-white/70 py-2.5 pl-10 pr-4 text-sm shadow-sm backdrop-blur placeholder:text-[#aab4ae] focus:border-[#173f32]/40 focus:outline-none focus:ring-2 focus:ring-[#173f32]/15"
            />
          </form>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <Link
                href={buildCatalogHref({ query: q })}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  !selectedCategory
                    ? "border-[#173f32] bg-[#173f32] text-white"
                    : "border-[#17201c]/15 bg-white/60 text-[#476057] hover:border-[#173f32]/40 hover:bg-white"
                }`}
              >
                Tümü
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildCatalogHref({
                    category: category.slug,
                    query: q,
                  })}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    selectedCategory?.id === category.id
                      ? "border-[#173f32] bg-[#173f32] text-white"
                      : "border-[#17201c]/15 bg-white/60 text-[#476057] hover:border-[#173f32]/40 hover:bg-white"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <section className="mb-8 rounded-2xl border border-[#17201c]/10 bg-white/55 p-3 shadow-sm backdrop-blur sm:p-4">
            <div className="flex items-center gap-3">
              <span className="hidden shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[#89938e] sm:inline">
                Alt kategoriler
              </span>
              <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
                <Link
                  href={buildCatalogHref({
                    category: selectedCategory.slug,
                    query: q,
                  })}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    !selectedSubcategory
                      ? "border-[#c2853e] bg-[#c2853e] text-white"
                      : "border-[#17201c]/15 bg-white text-[#476057] hover:border-[#c2853e]/50"
                  }`}
                >
                  Tümü
                </Link>
                {selectedCategory.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={buildCatalogHref({
                      category: selectedCategory.slug,
                      subcategory: subcategory.slug,
                      query: q,
                    })}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedSubcategory?.id === subcategory.id
                        ? "border-[#c2853e] bg-[#c2853e] text-white"
                        : "border-[#17201c]/15 bg-white text-[#476057] hover:border-[#c2853e]/50"
                    }`}
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── PRODUCT COUNT ── */}
        <p className="mb-6 text-sm text-[#89938e]">
          {totalProducts === 0
            ? "Ürün bulunamadı."
            : `${totalProducts} ürün arasından ${(currentPage - 1) * catalogPageSize + 1}-${Math.min(currentPage * catalogPageSize, totalProducts)} arası listeleniyor`}
        </p>

        {/* ── PRODUCT GRID ── */}
        {hasProducts ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/urun/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#173f32]/20 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#edf1ec]">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="size-12 text-[#b0bab4]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  {product.isFeatured && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#c2853e] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      Öne çıkan
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-3.5">
                  {product.brand && (
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c2853e]">
                      {product.brand}
                    </p>
                  )}
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#17201c]">
                    {product.name}
                  </p>
                  {product.catalogCategory && (
                    <p className="mt-1 text-[11px] text-[#89938e]">
                      {product.catalogSubcategory
                        ? `${product.catalogCategory.name} / ${product.catalogSubcategory.name}`
                        : product.catalogCategory.name}
                    </p>
                  )}
                  <div className="mt-auto pt-3">
                    <span className="text-[11px] font-medium text-[#173f32] opacity-0 transition group-hover:opacity-100">
                      Detaylar →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#17201c]/15 bg-white/40 py-20 text-center">
            <svg
              className="mb-4 size-12 text-[#b0bab4]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-base font-semibold text-[#476057]">
              Sonuç bulunamadı
            </p>
            <p className="mt-1 text-sm text-[#89938e]">
              Farklı bir arama veya kategori deneyin.
            </p>
            <Link
              href="/home"
              className="mt-5 rounded-full bg-[#173f32] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#10231d]"
            >
              Tüm ürünleri göster
            </Link>
          </div>
        )}

        {hasProducts && totalPages > 1 && (
          <nav
            aria-label="Katalog sayfaları"
            className="mt-10 flex items-center justify-center gap-3"
          >
            {currentPage > 1 ? (
              <Link
                href={buildCatalogHref({
                  category: selectedCategory?.slug,
                  subcategory: selectedSubcategory?.slug,
                  query: q,
                  page: currentPage - 1,
                })}
                className="rounded-full border border-[#17201c]/15 bg-white/70 px-4 py-2 text-xs font-semibold text-[#476057] transition hover:border-[#173f32]/40 hover:bg-white"
              >
                Önceki
              </Link>
            ) : (
              <span className="rounded-full border border-[#17201c]/10 px-4 py-2 text-xs font-semibold text-[#aab4ae]">
                Önceki
              </span>
            )}
            <span className="text-xs font-semibold text-[#63736b]">
              Sayfa {Math.min(currentPage, totalPages)} / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={buildCatalogHref({
                  category: selectedCategory?.slug,
                  subcategory: selectedSubcategory?.slug,
                  query: q,
                  page: currentPage + 1,
                })}
                className="rounded-full bg-[#173f32] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#10231d]"
              >
                Sonraki
              </Link>
            ) : (
              <span className="rounded-full bg-[#173f32]/20 px-4 py-2 text-xs font-semibold text-[#63736b]">
                Sonraki
              </span>
            )}
          </nav>
        )}
        </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative mt-16 border-t border-[#17201c]/10 bg-[#f4f1ea]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/logo.svg"
                alt="Lale EDT logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-[#476057]">
              {siteSettings.companyName}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#89938e]">
            <a
              href={getTelephoneHref(siteSettings.primaryPhone)}
              className="transition hover:text-[#173f32]"
            >
              {siteSettings.primaryPhone}
            </a>
            <a
              href={`mailto:${siteSettings.email}`}
              className="transition hover:text-[#173f32]"
            >
              {siteSettings.email}
            </a>
            <span>© 2026 Tüm hakları saklıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
