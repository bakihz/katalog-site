import { Prisma } from "@prisma/client";
import {
  adminProductPageSizeOptions,
  buildAdminProductsQueryString,
  parseAdminProductFilters,
} from "@/lib/adminProductFilters";
import {
  categoryReviewWhere,
  getCatalogReadiness,
  incompleteCatalogProductWhere,
  productQualityWhere,
  readyToPublishProductWhere,
} from "@/lib/productCatalogReadiness";
import { prisma } from "@/lib/prisma";
import { AppButton, PageHeader } from "@/components/ui";
import {
  ProductBulkCheckbox,
  ProductBulkSelection,
} from "@/components/admin/product-bulk-selection";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getBulkAlert(params: Record<string, string | string[] | undefined>) {
  const success = getFirstParam(params.bulkSuccess);
  const error = getFirstParam(params.bulkError);
  const updated = Number(getFirstParam(params.updated) ?? 0);
  const skipped = Number(getFirstParam(params.skipped) ?? 0);
  const suffix = skipped > 0 ? ` ${skipped} ürün koşulları karşılamadığı için atlandı.` : "";

  if (error === "selection") return { type: "error", message: "Toplu işlem için en az bir ürün seçmelisiniz." };
  if (error === "category") return { type: "error", message: "Seçilen kategori aktif değil veya bulunamadı." };
  if (error === "subcategory") return { type: "error", message: "Seçilen alt kategori bu kategoriye ait değil veya aktif değil." };
  if (error) return { type: "error", message: "Toplu ürün işlemi tamamlanamadı." };
  if (success === "category") return { type: "success", message: `${updated} ürüne kategori uygulandı.${suffix}` };
  if (success === "published") return { type: "success", message: `${updated} hazır ürün yayınlandı.${suffix}` };
  if (success === "hidden") return { type: "success", message: `${updated} ürün katalogdan gizlendi.${suffix}` };
  return null;
}

function getDisplayName(product: {
  name: string;
  storeName: string | null;
  logoName: string | null;
  stockCode: string | null;
}) {
  return product.name || product.storeName || product.logoName || product.stockCode || "İsimsiz ürün";
}

function buildWhere(filters: ReturnType<typeof parseAdminProductFilters>) {
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { stockCode: { contains: filters.q } },
        { name: { contains: filters.q } },
        { logoName: { contains: filters.q } },
        { storeName: { contains: filters.q } },
        { category: { contains: filters.q } },
        { brand: { contains: filters.q } },
      ],
    });
  }

  if (filters.visibility === "visible") {
    and.push({ showOnWebsite: true });
  }

  if (filters.visibility === "hidden") {
    and.push({ showOnWebsite: false });
  }

  if (filters.logoStatus === "active") {
    and.push({ logoIsActive: true });
  }

  if (filters.logoStatus === "inactive") {
    and.push({ logoIsActive: false });
  }

  if (filters.quality !== "all") {
    and.push(productQualityWhere[filters.quality]);
  }

  return and.length ? { AND: and } : {};
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const filters = parseAdminProductFilters(params);
  const where = buildWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    products,
    totalProducts,
    visibleProducts,
    categoryReviewProducts,
    incompleteProducts,
    readyToPublishProducts,
    inactiveProducts,
    activeCategories,
  ] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: filters.pageSize,
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { showOnWebsite: true } }),
      prisma.product.count({ where: categoryReviewWhere }),
      prisma.product.count({ where: incompleteCatalogProductWhere }),
      prisma.product.count({ where: readyToPublishProductWhere }),
      prisma.product.count({ where: { logoIsActive: false } }),
      prisma.catalogCategory.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          subcategories: {
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / filters.pageSize));
  const previousQuery = buildAdminProductsQueryString(filters, {
    page: String(Math.max(1, filters.page - 1)),
  });
  const nextQuery = buildAdminProductsQueryString(filters, {
    page: String(Math.min(totalPages, filters.page + 1)),
  });
  const currentQuery = buildAdminProductsQueryString(filters);
  const returnTo = `/admin/products${currentQuery ? `?${currentQuery}` : ""}`;
  const bulkAlert = getBulkAlert(params);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Katalog"
        title="Ürünler"
        description="Logo'dan gelen ham ürünleri katalog ürünü haline getirmek için yönetin."
      />

      {bulkAlert && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            bulkAlert.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {bulkAlert.message}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <div className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#89938e]">
            Toplam Kayıt
          </p>
          <p className="mt-2 text-2xl font-black text-[#17201c]">
            {totalProducts}
          </p>
          <p className="mt-1 text-sm text-[#68746e]">
            Filtreye uyan ürün sayısı.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Yayında
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {visibleProducts}
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Müşteriye görünecek ürünler.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Kategori Bekleyen
          </p>
          <p className="mt-2 text-2xl font-black text-amber-900">
            {categoryReviewProducts}
          </p>
          <p className="mt-1 text-sm text-amber-800">
            AI kategori önerisi incelenecek ürünler.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            Eksikleri Olan
          </p>
          <p className="mt-2 text-2xl font-black text-orange-900">
            {incompleteProducts}
          </p>
          <p className="mt-1 text-sm text-orange-800">
            Görsel, kategori veya açıklama eksiği var.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            Yayına Hazır
          </p>
          <p className="mt-2 text-2xl font-black text-sky-900">
            {readyToPublishProducts}
          </p>
          <p className="mt-1 text-sm text-sky-800">
            Kritik alanları tamamlanmış gizli ürünler.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
            Logo Pasif
          </p>
          <p className="mt-2 text-2xl font-black text-rose-900">
            {inactiveProducts}
          </p>
          <p className="mt-1 text-sm text-rose-800">
            Silinmeden katalog dışında tutulur.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-4 shadow-sm sm:p-6">
        <form className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_170px_170px_200px_130px]">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Stok kodu, ürün adı, kategori veya marka ara"
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          />
          <select
            name="visibility"
            defaultValue={filters.visibility}
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          >
            <option value="all">Tüm ürünler</option>
            <option value="visible">Yayında</option>
            <option value="hidden">Gizli</option>
          </select>
          <select
            name="logoStatus"
            defaultValue={filters.logoStatus}
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          >
            <option value="active">Logo aktif</option>
            <option value="inactive">Logo pasif</option>
            <option value="all">Tüm Logo durumları</option>
          </select>
          <select
            name="quality"
            defaultValue={filters.quality}
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          >
            <option value="all">Tüm kalite durumları</option>
            <option value="missing-image">Görsel yok</option>
            <option value="missing-category">Kategori yok</option>
            <option value="missing-name">İsim eksik</option>
            <option value="missing-description">Açıklama eksik</option>
            <option value="category-review">Kategori incelemesi</option>
            <option value="suggestion-pending">AI önerisi oluşturulmamış</option>
            <option value="incomplete">Tüm eksikli ürünler</option>
            <option value="ready-to-publish">Yayına hazır</option>
          </select>
          <button className="rounded-2xl bg-[#10231d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#173f32]">
            Filtrele
          </button>
          <input type="hidden" name="pageSize" value={filters.pageSize} />
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-4 shadow-sm sm:p-6">
        {products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#17201c]/20 bg-[#fcfbf8] p-8 text-sm text-[#68746e]">
            Filtreye uyan ürün bulunamadı.
          </div>
        ) : (
          <ProductBulkSelection
            productIds={products.map((product) => product.id)}
            categories={activeCategories}
            returnTo={returnTo}
          >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#17201c]/10 text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-[#89938e]">
                  <th className="w-10 px-3 py-3">
                    <span className="sr-only">Seçim</span>
                  </th>
                  <th className="px-3 py-3">Ürün</th>
                  <th className="px-3 py-3">Logo Bilgisi</th>
                  <th className="px-3 py-3">Katalog</th>
                  <th className="px-3 py-3">Durum</th>
                  <th className="px-3 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17201c]/10">
                {products.map((product) => {
                  const displayName = getDisplayName(product);
                  const readiness = getCatalogReadiness(product);
                  const missingBadges = readiness.issues;

                  return (
                    <tr key={product.id} className="align-top">
                      <td className="w-10 px-3 py-4">
                        <ProductBulkCheckbox productId={product.id} />
                      </td>
                      <td className="min-w-72 px-3 py-4">
                        <p className="font-bold text-[#17201c]">{displayName}</p>
                        <p className="mt-1 text-xs text-[#68746e]">
                          Stok kodu: {product.stockCode ?? "-"}
                        </p>
                        {product.logoName && product.logoName !== displayName && (
                          <p className="mt-1 text-xs text-[#89938e]">
                            Logo adı: {product.logoName}
                          </p>
                        )}
                      </td>
                      <td className="min-w-56 px-3 py-4 text-[#68746e]">
                        <p className={product.logoIsActive ? "" : "font-bold text-rose-700"}>
                          Logo: {product.logoIsActive ? "Aktif" : "Pasif — katalogda gösterilemez"}
                        </p>
                        <p>Kategori önerisi: {product.logoCategoryRaw ?? "-"}</p>
                        <p>Alt kategori: {product.logoSubCategoryRaw ?? "-"}</p>
                      </td>
                      <td className="min-w-56 px-3 py-4 text-[#68746e]">
                        <p>Kategori: {product.category ?? "-"}</p>
                        <p>Marka: {product.brand ?? "-"}</p>
                        <p>Logo marka ref: {product.logoBrandRef ?? "-"}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {missingBadges.map((badge) => (
                            <span
                              key={badge}
                              className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"
                            >
                              {badge}
                            </span>
                          ))}
                          {readiness.isReady && !product.showOnWebsite && (
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                              Yayına hazır
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {product.logoIsActive ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              product.showOnWebsite
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {product.showOnWebsite ? "Yayında" : "Gizli"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                            Logo pasif
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="ml-2 rounded-full bg-[#10231d] px-3 py-1 text-xs font-bold text-white">
                            Öne çıkan
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <AppButton
                          href={`/admin/products/${product.id}`}
                          variant="outline"
                          size="sm"
                        >
                          Düzenle
                        </AppButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </ProductBulkSelection>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-[#17201c]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#68746e]">
            Sayfa {filters.page} / {totalPages} · {totalProducts} kayıt
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form>
              <input type="hidden" name="q" value={filters.q} />
              <input type="hidden" name="visibility" value={filters.visibility} />
              <input type="hidden" name="logoStatus" value={filters.logoStatus} />
              <input type="hidden" name="quality" value={filters.quality} />
              <select
                name="pageSize"
                defaultValue={filters.pageSize}
                className="rounded-full border border-[#17201c]/10 bg-white px-3 py-2 text-xs font-semibold text-[#68746e]"
              >
                {adminProductPageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} / sayfa
                  </option>
                ))}
              </select>
              <button className="ml-2 rounded-full border border-[#17201c]/10 bg-white px-3 py-2 text-xs font-bold text-[#173f32]">
                Uygula
              </button>
            </form>
            <AppButton
              href={
                previousQuery ? `/admin/products?${previousQuery}` : "/admin/products"
              }
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
            >
              Önceki
            </AppButton>
            <AppButton
              href={nextQuery ? `/admin/products?${nextQuery}` : "/admin/products"}
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages}
            >
              Sonraki
            </AppButton>
          </div>
        </div>
      </section>
    </div>
  );
}
