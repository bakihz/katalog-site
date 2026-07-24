import type { Product } from "@prisma/client";

type ProductLogoRawDataProps = {
  product: Product;
};

function formatLogoDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProductLogoRawData({ product }: ProductLogoRawDataProps) {
  const rows = [
    ["Stok Kodu", product.stockCode],
    ["Logo Ürün Adı", product.logoName],
    ["Mağaza Adı / NAME2", product.storeName],
    ["Açıklama 2 / NAME3", product.logoDescription2],
    ["Açıklama 3 / NAME4", product.logoDescription3],
    [
      "Logo Kategori",
      `${product.logoCategoryRaw ?? "-"} / ${product.logoSubCategoryRaw ?? "-"}`,
    ],
    [
      "Google Taxonomy",
      product.googleTaxonomyPath
        ? `${product.googleTaxonomyId ?? "-"} - ${product.googleTaxonomyPath}`
        : "-",
    ],
    [
      "Logo Marka Ref",
      `${product.logoBrandRef ?? "-"}${
        product.logoBrandName ? ` / ${product.logoBrandName}` : ""
      }`,
    ],
    [
      "Logo Birim",
      `${product.logoUnitSetRef ?? "-"}${
        product.logoUnitName ? ` / ${product.logoUnitName}` : ""
      }`,
    ],
    ["Logo Durumu", product.logoIsActive ? "Aktif" : "Pasif"],
    ["KDV", product.vatRate],
    ["Son Logo Güncelleme", formatLogoDate(product.lastLogoModifiedAt)],
    ["Son Import", formatLogoDate(product.lastLogoSyncAt)],
  ] satisfies Array<[string, string | number | null]>;

  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold">Logo Ham Verisi</h3>
      <p className="mt-1 text-sm text-[#68746e]">
        Bu alanlar referans içindir. Katalog düzenlemesi Logo verisini
        değiştirmez.
      </p>
      <dl className="mt-5 space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold text-[#68746e]">{label}</dt>
            <dd className="whitespace-pre-line text-[#17201c]">
              {value ?? "-"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
