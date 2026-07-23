import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicProductBaseWhere } from "@/lib/publicCatalog";
import { getSiteSettings } from "@/lib/siteSettings";

type ProductListingProps = {
  title: string;
  description: string;
  query?: string;
  requestedPage?: string;
  scopeWhere?: Prisma.ProductWhereInput;
  baseHref: string;
  persistentParams?: Record<string, string>;
  breadcrumbs: Array<{ label: string; href?: string }>;
};

function buildListingHref(
  baseHref: string,
  persistentParams: Record<string, string>,
  query?: string,
  page?: number,
) {
  const params = new URLSearchParams(persistentParams);
  if (query) params.set("q", query);
  if (page && page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `${baseHref}?${queryString}` : baseHref;
}

export async function ProductListing({
  title,
  description,
  query,
  requestedPage,
  scopeWhere = {},
  baseHref,
  persistentParams = {},
  breadcrumbs,
}: ProductListingProps) {
  const q = query?.trim().slice(0, 100) || undefined;
  const parsedPage = Number(requestedPage ?? "1");
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const siteSettings = await getSiteSettings();
  const pageSize = siteSettings.catalogPageSize;
  const where: Prisma.ProductWhereInput = {
    AND: [
      publicProductBaseWhere,
      scopeWhere,
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
        imageUrl: true,
        isFeatured: true,
        catalogCategory: { select: { name: true } },
        catalogSubcategory: { select: { name: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  return (
    <>
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#68746e]">
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={`${breadcrumb.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span className="text-[#b0bab4]">/</span>}
            {breadcrumb.href ? (
              <Link href={breadcrumb.href} className="transition hover:text-[#173f32]">
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-[#173f32]">{breadcrumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c2853e]">
            Ürün Kataloğu
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#68746e] sm:text-base">
            {description}
          </p>
        </div>
        <form method="GET" className="relative w-full lg:max-w-xs">
          {Object.entries(persistentParams).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Ürün veya marka ara…"
            className="w-full rounded-full border border-[#17201c]/15 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#173f32]/40 focus:ring-2 focus:ring-[#173f32]/10"
          />
        </form>
      </section>

      <p className="mb-6 text-sm text-[#89938e]">
        {totalProducts === 0
          ? "Ürün bulunamadı."
          : `${totalProducts} ürün arasından ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalProducts)} arası gösteriliyor.`}
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/urun/${product.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-sm transition hover:-translate-y-0.5 hover:border-[#173f32]/20 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-[#edf1ec]">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl font-black text-[#173f32]/15">
                    {product.name.charAt(0)}
                  </div>
                )}
                {product.isFeatured && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#c2853e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Öne çıkan
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                {product.brand && (
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c2853e]">
                    {product.brand}
                  </p>
                )}
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
                  {product.name}
                </h2>
                <p className="mt-1 text-[11px] text-[#89938e]">
                  {product.catalogSubcategory?.name ?? product.catalogCategory?.name}
                </p>
                <span className="mt-auto pt-4 text-xs font-bold text-[#173f32]">
                  Detaylar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#17201c]/15 bg-white/50 py-16 text-center">
          <p className="font-semibold text-[#476057]">Sonuç bulunamadı</p>
          <Link href={buildListingHref(baseHref, persistentParams)} className="mt-4 inline-flex rounded-full bg-[#173f32] px-5 py-2 text-xs font-bold text-white">
            Aramayı temizle
          </Link>
        </div>
      )}

      {products.length > 0 && totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Ürün sayfaları">
          {currentPage > 1 ? (
            <Link href={buildListingHref(baseHref, persistentParams, q, currentPage - 1)} className="rounded-full border border-[#17201c]/15 bg-white px-4 py-2 text-xs font-bold">
              Önceki
            </Link>
          ) : (
            <span className="rounded-full border border-[#17201c]/10 px-4 py-2 text-xs font-bold text-[#aab4ae]">Önceki</span>
          )}
          <span className="text-xs font-bold text-[#63736b]">Sayfa {Math.min(currentPage, totalPages)} / {totalPages}</span>
          {currentPage < totalPages ? (
            <Link href={buildListingHref(baseHref, persistentParams, q, currentPage + 1)} className="rounded-full bg-[#173f32] px-4 py-2 text-xs font-bold text-white">
              Sonraki
            </Link>
          ) : (
            <span className="rounded-full bg-[#173f32]/15 px-4 py-2 text-xs font-bold text-[#89938e]">Sonraki</span>
          )}
        </nav>
      )}
    </>
  );
}
