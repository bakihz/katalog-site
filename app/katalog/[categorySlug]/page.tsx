import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/catalog/category-card";
import { getPublicCategories } from "@/lib/publicCatalog";

export default async function CatalogSubcategoriesPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const categories = await getPublicCategories();
  const category = categories.find((item) => item.slug === categorySlug);

  if (!category) notFound();

  return (
    <>
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#68746e]">
        <Link href="/home" className="transition hover:text-[#173f32]">Ana Sayfa</Link>
        <span className="text-[#b0bab4]">/</span>
        <Link href="/katalog" className="transition hover:text-[#173f32]">Kategoriler</Link>
        <span className="text-[#b0bab4]">/</span>
        <span className="text-[#173f32]">{category.name}</span>
      </nav>

      <section className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c2853e]">Alt Kategori Seçimi</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">{category.homepageTitle ?? category.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[#68746e] sm:text-base">
            Alt kategori seçin veya bu ana kategorideki bütün ürünleri görüntüleyin.
          </p>
        </div>
        <Link href={`/urunler?kategori=${encodeURIComponent(category.slug)}`} className="inline-flex w-fit rounded-full bg-[#173f32] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d]">
          Bu Kategorideki Tüm Ürünler →
        </Link>
      </section>

      {category.subcategories.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.subcategories.map((subcategory) => (
            <CategoryCard
              key={subcategory.id}
              href={`/katalog/${category.slug}/${subcategory.slug}`}
              title={subcategory.name}
              eyebrow={category.name}
              count={subcategory._count.products}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#17201c]/15 bg-white/50 py-16 text-center">
          <p className="text-sm text-[#68746e]">Bu kategoride ayrıca tanımlanmış alt kategori bulunmuyor.</p>
          <Link href={`/urunler?kategori=${encodeURIComponent(category.slug)}`} className="mt-4 inline-flex rounded-full bg-[#173f32] px-5 py-3 text-sm font-bold text-white">
            Kategorideki ürünleri göster
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/urunler?kategori=${encodeURIComponent(category.slug)}`} className="rounded-full border border-[#173f32]/20 bg-white/70 px-5 py-3 text-sm font-bold text-[#173f32] transition hover:bg-white">
          Alt kategori seçmeden tümünü göster
        </Link>
        <Link href="/urunler" className="rounded-full px-5 py-3 text-sm font-bold text-[#68746e] transition hover:text-[#173f32]">
          Tüm katalog ürünleri
        </Link>
      </div>
    </>
  );
}
