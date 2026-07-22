"use client";

import { useRef, useState } from "react";

type CategoryShowcaseItemProps = {
  category: {
    id: number;
    name: string;
    homepageTitle: string | null;
    homepageDescription: string | null;
    homepageImageUrl: string | null;
    homepageSortOrder: number;
    showOnHomepage: boolean;
    publishedProductCount: number;
  };
};

const inputClassName =
  "w-full rounded-xl border border-[#17201c]/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#173f32]/40";

export function CategoryShowcaseItem({ category }: CategoryShowcaseItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(category.homepageImageUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadImage(file: File) {
    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(
        `/api/admin/categories/${category.id}/homepage-image`,
        { method: "POST", body: formData },
      );
      const payload = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "Kategori görseli yüklenemedi.");
      }

      setImageUrl(payload.imageUrl);
      setMessage("Görsel yüklendi.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Kategori görseli yüklenemedi.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <article className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] p-4">
      <div className="grid gap-4 lg:grid-cols-[10rem_minmax(0,1fr)_8rem]">
        <div>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-[#e8eee9]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${category.name} kategori görseli`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-3 text-center text-xs font-semibold text-[#68746e]">
                Görsel eklenmedi
              </span>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 w-full rounded-xl bg-[#173f32] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#10231d] disabled:opacity-60"
          >
            {isUploading ? "Yükleniyor..." : "Görsel Seç"}
          </button>
          {message && (
            <p className="mt-2 text-xs leading-5 text-[#476057]" role="status">
              {message}
            </p>
          )}
        </div>

        <div className="grid content-start gap-3">
          <div>
            <p className="font-bold text-[#17201c]">{category.name}</p>
            <p className="mt-1 text-xs text-[#68746e]">
              {category.publishedProductCount} yayınlanmış ürün
            </p>
          </div>
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Vitrinde görünecek başlık
            </span>
            <input
              name={`category_${category.id}_title`}
              defaultValue={category.homepageTitle ?? category.name}
              maxLength={255}
              className={inputClassName}
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Kısa açıklama
            </span>
            <input
              name={`category_${category.id}_description`}
              defaultValue={category.homepageDescription ?? ""}
              maxLength={400}
              placeholder="İsteğe bağlı"
              className={inputClassName}
            />
          </label>
          <details>
            <summary className="cursor-pointer text-xs font-semibold text-[#476057]">
              Görsel bağlantısı kullan
            </summary>
            <input
              name={`category_${category.id}_imageUrl`}
              type="text"
              inputMode="url"
              value={imageUrl}
              maxLength={1000}
              placeholder="https://..."
              onChange={(event) => setImageUrl(event.target.value)}
              className={`${inputClassName} mt-2`}
            />
          </details>
        </div>

        <div className="grid content-start gap-3">
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Vitrin sırası
            </span>
            <input
              name={`category_${category.id}_order`}
              type="number"
              min={0}
              max={9999}
              defaultValue={category.homepageSortOrder}
              className={inputClassName}
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-[#17201c]/10 bg-white px-3 py-2.5">
            <input
              name={`category_${category.id}_visible`}
              type="checkbox"
              defaultChecked={category.showOnHomepage}
              className="size-4 accent-[#173f32]"
            />
            <span className="text-sm font-semibold">Vitrinde göster</span>
          </label>
        </div>
      </div>
    </article>
  );
}
