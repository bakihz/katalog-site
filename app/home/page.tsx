import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string }>;
}) {
  const { kategori, q } = await searchParams;

  const cookieStore = await cookies();
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

  const rawProducts = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // showOnWebsite filtresini JS'te uygula (engine yeniden oluşturulana kadar)
  const allProducts = rawProducts.filter((p) => p.showOnWebsite === true);

  // Unique categories
  const categories = Array.from(
    new Set(
      allProducts
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  // Filter
  const filtered = allProducts.filter((p) => {
    const matchCat = kategori ? p.category === kategori : true;
    const matchQ = q
      ? p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(q.toLowerCase())
      : true;
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#17201c]">
      {/* Subtle dot pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-[#17201c]/10 bg-[#f4f1ea]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <Link href="/home" className="flex items-center gap-3">
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
            <div>
              <p className="text-base font-bold tracking-tight leading-tight">
                Lale EDT Gıda A.Ş.
              </p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#63736b]">
                Ürün kataloğu
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={agentLoginHref}
              className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d]"
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
                "Temsilci Girişi"
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
        {/* ── HERO ── */}
        <section className="mb-12">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#173f32]/8 px-4 py-2 text-sm font-semibold text-[#173f32]">
            <span className="size-2 rounded-full bg-[#c2853e]" />
            Ürün & Hizmet Kataloğu
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
            Kaliteli Gıda,
            <br />
            <span className="text-[#c2853e]">Güvenilir Tedarik.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#5d6963]">
            Tüm ürünlerimize göz atın. Detay ve fiyat bilgisi için
            temsilcimizle iletişime geçebilirsiniz.
          </p>
        </section>

        {/* ── SEARCH + FILTERS ── */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <form method="GET" className="relative w-full sm:max-w-xs">
            {kategori && (
              <input type="hidden" name="kategori" value={kategori} />
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
            <div className="flex flex-wrap gap-2">
              <Link
                href={q ? `/home?q=${encodeURIComponent(q)}` : "/home"}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  !kategori
                    ? "border-[#173f32] bg-[#173f32] text-white"
                    : "border-[#17201c]/15 bg-white/60 text-[#476057] hover:border-[#173f32]/40 hover:bg-white"
                }`}
              >
                Tümü
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/home?kategori=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    kategori === cat
                      ? "border-[#173f32] bg-[#173f32] text-white"
                      : "border-[#17201c]/15 bg-white/60 text-[#476057] hover:border-[#173f32]/40 hover:bg-white"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── PRODUCT COUNT ── */}
        <p className="mb-6 text-sm text-[#89938e]">
          {filtered.length === 0
            ? "Ürün bulunamadı."
            : `${filtered.length} ürün listeleniyor`}
        </p>

        {/* ── PRODUCT GRID ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product) => (
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
                  {product.category && (
                    <p className="mt-1 text-[11px] text-[#89938e]">
                      {product.subCategory
                        ? `${product.category} / ${product.subCategory}`
                        : product.category}
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
              Lale EDT Gıda A.Ş.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#89938e]">
            <a
              href="tel:+905443033366"
              className="transition hover:text-[#173f32]"
            >
              0 (544) 303 33 66
            </a>
            <a
              href="mailto:info@laleedt.com.tr"
              className="transition hover:text-[#173f32]"
            >
              info@laleedt.com.tr
            </a>
            <span>© 2026 Tüm hakları saklıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
