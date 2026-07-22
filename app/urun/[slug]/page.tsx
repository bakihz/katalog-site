/* eslint-disable @next/next/no-img-element */
import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const getPublishedProduct = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: {
      slug,
      showOnWebsite: true,
      logoIsActive: true,
      catalogCategory: { isActive: true },
      OR: [
        { catalogSubcategoryId: null },
        { catalogSubcategory: { isActive: true } },
      ],
    },
    select: {
      name: true,
      slug: true,
      imageUrl: true,
      brand: true,
      catalogCategory: { select: { name: true, slug: true } },
      catalogSubcategory: { select: { name: true, slug: true } },
      shortDescription: true,
      description: true,
      features: true,
      unit: true,
    },
  }),
);

function getFeatureList(features: string | null) {
  return (features ?? "")
    .split(/\r?\n|•/)
    .map((feature) => feature.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

  if (!product) {
    return { title: "Ürün Bulunamadı | Lale EDT Gıda" };
  }

  const description =
    product.shortDescription ??
    product.description ??
    "Lale EDT Gıda ürün kataloğunda ürün detaylarını inceleyin.";

  return {
    title: `${product.name} | Lale EDT Gıda`,
    description,
    alternates: {
      canonical: `/urun/${encodeURIComponent(product.slug)}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, cookieStore] = await Promise.all([
    getPublishedProduct(slug),
    cookies(),
  ]);

  if (!product?.catalogCategory) {
    notFound();
  }

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
  const featureList = getFeatureList(product.features);
  const detailItems = [
    { label: "Kategori", value: product.catalogCategory.name },
    { label: "Alt kategori", value: product.catalogSubcategory?.name },
    { label: "Birim", value: product.unit },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
  const displayDescription = product.description ?? product.shortDescription;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#17201c]">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

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
                Lale EDT Gıda A.Ş.
              </p>
              <p className="hidden text-[11px] uppercase tracking-[0.22em] text-[#63736b] sm:block">
                Ürün kataloğu
              </p>
            </div>
          </Link>

          <Link
            href={agentLoginHref}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#173f32] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d] sm:px-4 sm:tracking-[0.14em]"
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
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-12 lg:px-16">
        <Link
          href="/home"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#476057] transition hover:text-[#173f32]"
        >
          <span aria-hidden="true">←</span>
          Kataloğa dön
        </Link>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-xl shadow-[#173f32]/8">
            <div className="relative aspect-square overflow-hidden bg-[#e9eee9]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-[#789087]">
                  <svg
                    className="size-16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <p className="text-sm font-medium">Ürün görseli hazırlanıyor</p>
                </div>
              )}
            </div>
          </div>

          <div className="py-1">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c2853e]">
              <Link
                href={`/home?kategori=${encodeURIComponent(product.catalogCategory.slug)}`}
                className="transition hover:text-[#173f32]"
              >
                {product.catalogCategory.name}
              </Link>
              {product.catalogSubcategory && (
                <>
                  <span className="text-[#c2853e]/45">/</span>
                  <Link
                    href={`/home?kategori=${encodeURIComponent(product.catalogCategory.slug)}&altKategori=${encodeURIComponent(product.catalogSubcategory.slug)}`}
                    className="transition hover:text-[#173f32]"
                  >
                    {product.catalogSubcategory.name}
                  </Link>
                </>
              )}
            </div>
            {product.brand && (
              <p className="mb-2 text-sm font-semibold text-[#63736b]">{product.brand}</p>
            )}
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d6963]">
                {product.shortDescription}
              </p>
            )}

            {detailItems.length > 0 && (
              <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-[#17201c]/10 bg-[#17201c]/10 sm:grid-cols-3">
                {detailItems.map((item) => (
                  <div key={item.label} className="bg-white/80 px-4 py-4">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#89938e]">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#31433b]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 rounded-[1.5rem] border border-[#173f32]/10 bg-white/70 p-5 shadow-sm sm:p-6">
              <p className="text-sm font-bold text-[#17201c]">Fiyat ve sipariş bilgisi</p>
              <p className="mt-1 text-sm leading-6 text-[#63736b]">
                Güncel fiyat, ürün uygunluğu ve sipariş için ekibimizle iletişime geçebilirsiniz.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="tel:+905443033366"
                  className="rounded-full bg-[#173f32] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#10231d]"
                >
                  Hemen ara
                </a>
                <a
                  href="mailto:info@laleedt.com.tr"
                  className="rounded-full border border-[#173f32]/15 bg-white px-4 py-2.5 text-xs font-semibold text-[#173f32] transition hover:border-[#173f32]/35"
                >
                  E-posta gönder
                </a>
              </div>
            </div>
          </div>
        </section>

        {(displayDescription || featureList.length > 0) && (
          <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.6fr)]">
            {displayDescription && (
              <article className="rounded-[1.75rem] border border-white/80 bg-white/70 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2853e]">Ürün hakkında</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">Açıklama</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#52625b] sm:text-base">
                  {displayDescription}
                </p>
              </article>
            )}

            {featureList.length > 0 && (
              <article className="rounded-[1.75rem] border border-[#173f32]/10 bg-[#e6eee7] p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#476057]">Özellikler</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#31433b]">
                  {featureList.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#c2853e]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </section>
        )}
      </main>

      <footer className="relative mt-8 border-t border-[#17201c]/10 bg-[#f4f1ea]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
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
            <p className="text-xs font-semibold text-[#476057]">Lale EDT Gıda A.Ş.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#89938e]">
            <a href="tel:+905443033366" className="transition hover:text-[#173f32]">
              0 (544) 303 33 66
            </a>
            <a href="mailto:info@laleedt.com.tr" className="transition hover:text-[#173f32]">
              info@laleedt.com.tr
            </a>
            <span>© 2026 Tüm hakları saklıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
