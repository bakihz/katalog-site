"use client";

import { useMemo, useState } from "react";

type CatalogCategoryOption = {
  id: number;
  name: string;
  subcategories: { id: number; name: string }[];
};

type ProductCategoryFieldsProps = {
  categories: CatalogCategoryOption[];
  initialCategoryId: number | null;
  initialSubcategoryId: number | null;
  inputClassName: string;
  labelClassName: string;
};

export function ProductCategoryFields({
  categories,
  initialCategoryId,
  initialSubcategoryId,
  inputClassName,
  labelClassName,
}: ProductCategoryFieldsProps) {
  const [categoryId, setCategoryId] = useState(String(initialCategoryId ?? ""));
  const [subcategoryId, setSubcategoryId] = useState(
    String(initialSubcategoryId ?? ""),
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === categoryId),
    [categories, categoryId],
  );

  return (
    <>
      <div>
        <label className={labelClassName}>Kategori</label>
        <select
          name="catalogCategoryId"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setSubcategoryId("");
          }}
          className={inputClassName}
        >
          <option value="">Kategori seçin</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClassName}>Alt kategori</label>
        <select
          name="catalogSubcategoryId"
          value={subcategoryId}
          onChange={(event) => setSubcategoryId(event.target.value)}
          disabled={!selectedCategory || selectedCategory.subcategories.length === 0}
          className={inputClassName}
        >
          <option value="">
            {!selectedCategory
              ? "Önce kategori seçin"
              : selectedCategory.subcategories.length === 0
                ? "Aktif alt kategori yok"
                : "Alt kategori seçin (isteğe bağlı)"}
          </option>
          {selectedCategory?.subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
