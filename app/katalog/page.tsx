import Link from "next/link";
import type { Metadata } from "next";
import { CategoryCard } from "@/components/catalog/category-card";
import { getPublicCategorySummaries } from "@/lib/publicCatalog";

export const metadata: Metadata = {
  title: "Ürün Kategorileri | Lale EDT Gıda",
  description: "Lale EDT Gıda ürün kategorilerini keşfedin.",
};

export default async function CatalogCategoriesPage() {
  const categories = await getPublicCategorySummaries();

  return (
    <>
      <nav className="mb-6 text-xs font-semibold text-[#68746e]">
        <Link href="/home" className="transition hover:text-[#173f32]">Ana Sayfa</Link>
        <span className="mx-2 text-[#b0bab4]">/</span>
        <span className="text-[#173f32]">Kategoriler</span>
      </nav>

      <section className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c2853e]">Katalog</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Ne arıyorsunuz?</h1>
          <p className="mt-3 text-sm leading-6 text-[#68746e] sm:text-base">
            Ürün gruplarından birini seçin veya kategori seçmeden tüm ürünlere geçin.
          </p>
        </div>
        <Link href="/urunler" className="inline-flex w-fit rounded-full bg-[#173f32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#10231d]">
          Tüm Ürünleri Gör →
        </Link>
      </section>

      {categories.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              href={`/katalog/${category.slug}`}
              title={category.homepageTitle ?? category.name}
              description={category.homepageDescription}
              imageUrl={category.homepageImageUrl}
              count={category._count.products}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#17201c]/15 bg-white/50 py-16 text-center text-sm text-[#68746e]">
          Yayınlanmış ürün içeren kategori bulunmuyor.
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link href="/urunler" className="rounded-full border border-[#173f32]/20 bg-white/70 px-5 py-3 text-sm font-bold text-[#173f32] transition hover:bg-white">
          Kategori seçmeden tümünü göster
        </Link>
      </div>
    </>
  );
}
