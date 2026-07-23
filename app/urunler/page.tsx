import { notFound, redirect } from "next/navigation";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ProductListing } from "@/components/catalog/product-listing";
import { getPublicCategoryBySlug } from "@/lib/publicCatalog";

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    kategori?: string;
    altKategori?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const filters = await searchParams;
  const category = filters.kategori
    ? await getPublicCategoryBySlug(filters.kategori)
    : undefined;

  if (filters.kategori && !category) notFound();

  if (category && filters.altKategori) {
    const subcategory = category.subcategories.find(
      (item) => item.slug === filters.altKategori,
    );
    if (!subcategory) notFound();

    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.page) params.set("page", filters.page);
    const suffix = params.toString();
    redirect(
      `/katalog/${category.slug}/${subcategory.slug}${suffix ? `?${suffix}` : ""}`,
    );
  }

  return (
    <CatalogShell>
      <ProductListing
        title={category ? `${category.name} Ürünleri` : "Tüm Ürünler"}
        description={
          category
            ? `${category.name} ana kategorisindeki tüm alt kategorilerin ürünlerini birlikte inceleyin.`
            : "Yayınlanan tüm katalog ürünlerini kategori seçmeden inceleyin."
        }
        query={filters.q}
        requestedPage={filters.page}
        scopeWhere={category ? { catalogCategoryId: category.id } : {}}
        baseHref="/urunler"
        persistentParams={category ? { kategori: category.slug } : {}}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/home" },
          { label: "Kategoriler", href: "/katalog" },
          ...(category
            ? [
                { label: category.name, href: `/katalog/${category.slug}` },
                { label: "Tüm ürünler" },
              ]
            : [{ label: "Tüm ürünler" }]),
        ]}
      />
    </CatalogShell>
  );
}
