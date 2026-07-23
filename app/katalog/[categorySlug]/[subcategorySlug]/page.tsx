import { notFound } from "next/navigation";
import { ProductListing } from "@/components/catalog/product-listing";
import { getPublicCategories } from "@/lib/publicCatalog";

export default async function SubcategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const [{ categorySlug, subcategorySlug }, filters, categories] =
    await Promise.all([params, searchParams, getPublicCategories()]);
  const category = categories.find((item) => item.slug === categorySlug);
  const subcategory = category?.subcategories.find(
    (item) => item.slug === subcategorySlug,
  );

  if (!category || !subcategory) notFound();

  return (
    <ProductListing
      title={subcategory.name}
      description={`${category.name} kategorisindeki ${subcategory.name} ürünlerini inceleyin.`}
      query={filters.q}
      requestedPage={filters.page}
      scopeWhere={{
        catalogCategoryId: category.id,
        catalogSubcategoryId: subcategory.id,
      }}
      baseHref={`/katalog/${category.slug}/${subcategory.slug}`}
      breadcrumbs={[
        { label: "Ana Sayfa", href: "/home" },
        { label: "Kategoriler", href: "/katalog" },
        { label: category.name, href: `/katalog/${category.slug}` },
        { label: subcategory.name },
      ]}
    />
  );
}
