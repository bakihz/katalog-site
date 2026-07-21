"use client";

import { useRef, useState } from "react";

type ProductImageUploadProps = {
  productId: number;
  initialImageUrl: string | null;
};

export function ProductImageUpload({
  productId,
  initialImageUrl,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadImage(file: File) {
    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "Görsel yüklenemedi.");
      }

      setImageUrl(payload.imageUrl);
      setMessage("Görsel yüklendi. Kaydetmeden de ürün kaydına işlendi.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Görsel yüklenemedi.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#173f32]/25 bg-[#f8f6f1] p-4">
      <input name="imageUrl" type="hidden" value={imageUrl} readOnly />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:w-28">
          {imageUrl ? (
            // External links remain supported for products imported from another source.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Ürün görseli önizlemesi"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="px-3 text-center text-xs text-[#68746e]">
              Henüz görsel yok
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#17201c]">Ürün görseli</p>
          <p className="mt-1 text-xs leading-5 text-[#68746e]">
            JPG, PNG veya WebP dosyası seç. En fazla 5 MB.
          </p>
          <input
            ref={fileInputRef}
            type="file"
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
            className="mt-3 rounded-xl bg-[#173f32] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#123329] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Yükleniyor..." : "Bilgisayardan Görsel Seç"}
          </button>
          {message && (
            <p className="mt-2 text-xs leading-5 text-[#476057]" role="status">
              {message}
            </p>
          )}
        </div>
      </div>

      <details className="mt-4 border-t border-[#17201c]/10 pt-3">
        <summary className="cursor-pointer text-xs font-semibold text-[#476057]">
          Görsel bağlantısı yapıştır
        </summary>
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://..."
          className="mt-3 w-full rounded-xl border border-[#17201c]/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#173f32]/40"
        />
      </details>
    </div>
  );
}
