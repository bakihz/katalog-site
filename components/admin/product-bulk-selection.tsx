"use client";

import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { AppButton } from "@/components/ui";

type BulkCategory = {
  id: number;
  name: string;
  subcategories: Array<{ id: number; name: string }>;
};

type SelectionContextValue = {
  selectedIds: Set<number>;
  toggleProduct: (productId: number) => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function ProductBulkSelection({
  productIds,
  categories,
  returnTo,
  children,
}: {
  productIds: number[];
  categories: BulkCategory[];
  returnTo: string;
  children: ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId,
  );
  const allSelected =
    productIds.length > 0 && productIds.every((id) => selectedIds.has(id));

  const contextValue = useMemo<SelectionContextValue>(
    () => ({
      selectedIds,
      toggleProduct(productId) {
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(productId)) next.delete(productId);
          else next.add(productId);
          return next;
        });
      },
    }),
    [selectedIds],
  );

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(productIds));
  }

  function confirmBulkAction(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const action = submitter?.value;

    if (action === "publish" && !window.confirm("Hazır olan seçili ürünler yayınlansın mı?")) {
      event.preventDefault();
    }

    if (action === "hide" && !window.confirm("Seçili ürünler arşivlenip katalogdan kaldırılsın mı?")) {
      event.preventDefault();
    }
  }

  return (
    <SelectionContext.Provider value={contextValue}>
      <form
        action="/api/admin/products/bulk"
        method="POST"
        onSubmit={confirmBulkAction}
        className="space-y-4"
      >
        <input type="hidden" name="returnTo" value={returnTo} />

        <div className="rounded-2xl border border-[#173f32]/15 bg-[#edf1ec] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleAll}
                className="rounded-full border border-[#173f32]/15 bg-white px-4 py-2 text-xs font-bold text-[#173f32] transition hover:border-[#173f32]/35"
              >
                {allSelected ? "Seçimi Temizle" : "Bu Sayfadakileri Seç"}
              </button>
              <span className="rounded-full bg-[#10231d] px-3 py-1.5 text-xs font-bold text-white">
                {selectedIds.size} ürün seçili
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[34rem]">
              <select
                name="categoryId"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId("");
                }}
                className="min-w-0 rounded-xl border border-[#17201c]/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173f32]/40"
              >
                <option value="">Kategori seç</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                name="subcategoryId"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                disabled={!selectedCategory}
                className="min-w-0 rounded-xl border border-[#17201c]/10 bg-white px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-[#173f32]/40"
              >
                <option value="">Alt kategori yok / seç</option>
                {selectedCategory?.subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-[#173f32]/10 pt-3">
            <AppButton
              type="submit"
              name="action"
              value="assign-category"
              size="sm"
              disabled={selectedIds.size === 0 || !categoryId}
            >
              Kategoriyi Uygula
            </AppButton>
            <AppButton
              type="submit"
              name="action"
              value="publish"
              size="sm"
              variant="secondary"
              disabled={selectedIds.size === 0}
            >
              Hazır Olanları Yayınla
            </AppButton>
            <AppButton
              type="submit"
              name="action"
              value="hide"
              size="sm"
              variant="outline"
              disabled={selectedIds.size === 0}
            >
              Arşivle
            </AppButton>
          </div>
        </div>

        {children}
      </form>
    </SelectionContext.Provider>
  );
}

export function ProductBulkCheckbox({ productId }: { productId: number }) {
  const context = useContext(SelectionContext);

  if (!context) return null;

  return (
    <input
      type="checkbox"
      name="productIds"
      value={productId}
      checked={context.selectedIds.has(productId)}
      onChange={() => context.toggleProduct(productId)}
      aria-label={`Ürün ${productId} seç`}
      className="h-4 w-4 cursor-pointer accent-[#173f32]"
    />
  );
}
