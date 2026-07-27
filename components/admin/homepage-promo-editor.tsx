"use client";

import { useRef, useState } from "react";

type HomepagePromoEditorProps = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
};

type ImageVariant = "desktop" | "mobile";

const inputClassName =
  "w-full rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2.5 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

export function HomepagePromoEditor({
  title,
  description,
  imageUrl: initialImageUrl,
  mobileImageUrl: initialMobileImageUrl,
  buttonLabel,
  buttonUrl,
}: HomepagePromoEditorProps) {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [mobileImageUrl, setMobileImageUrl] = useState(
    initialMobileImageUrl ?? "",
  );
  const [uploading, setUploading] = useState<ImageVariant | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadImage(file: File, variant: ImageVariant) {
    setUploading(variant);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("variant", variant);

      const response = await fetch("/api/admin/homepage/hero-image", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "Tanıtım görseli yüklenemedi.");
      }

      if (variant === "mobile") {
        setMobileImageUrl(payload.imageUrl);
      } else {
        setImageUrl(payload.imageUrl);
      }
      setMessage(
        variant === "mobile"
          ? "Mobil tanıtım görseli yüklendi."
          : "Masaüstü tanıtım görseli yüklendi.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tanıtım görseli yüklenemedi.",
      );
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <HeroImageControl
          label="Masaüstü görseli"
          hint="Önerilen: 1920 × 1080 veya daha geniş, yatay WebP/JPG"
          imageUrl={imageUrl}
          inputRef={desktopInputRef}
          isUploading={uploading === "desktop"}
          onSelect={(file) => uploadImage(file, "desktop")}
        />
        <HeroImageControl
          label="Mobil görsel"
          hint="Önerilen: 1080 × 1600, dikey WebP/JPG"
          imageUrl={mobileImageUrl}
          inputRef={mobileInputRef}
          isUploading={uploading === "mobile"}
          onSelect={(file) => uploadImage(file, "mobile")}
        />
      </div>

      {message && (
        <p
          className="rounded-xl bg-[#edf1ec] px-3 py-2 text-xs font-semibold text-[#476057]"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Tanıtım başlığı
          </span>
          <input
            name="promoHeroTitle"
            required
            maxLength={200}
            defaultValue={title ?? ""}
            className={inputClassName}
          />
        </label>
        <label className="lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Kısa açıklama
          </span>
          <textarea
            name="promoHeroDescription"
            maxLength={600}
            rows={3}
            defaultValue={description ?? ""}
            className={inputClassName}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Buton yazısı
          </span>
          <input
            name="promoHeroButtonLabel"
            maxLength={120}
            defaultValue={buttonLabel ?? ""}
            placeholder="Ürünleri Keşfet"
            className={inputClassName}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Buton bağlantısı
          </span>
          <input
            name="promoHeroButtonUrl"
            maxLength={1000}
            defaultValue={buttonUrl ?? ""}
            placeholder="/katalog"
            className={inputClassName}
          />
        </label>
      </div>

      <details>
        <summary className="cursor-pointer text-xs font-semibold text-[#476057]">
          Görsel bağlantılarını düzenle
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Masaüstü görsel URL
            </span>
            <input
              name="promoHeroImageUrl"
              value={imageUrl}
              maxLength={1000}
              placeholder="https://..."
              onChange={(event) => setImageUrl(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Mobil görsel URL
            </span>
            <input
              name="promoHeroMobileImageUrl"
              value={mobileImageUrl}
              maxLength={1000}
              placeholder="Boşsa masaüstü görseli kullanılır"
              onChange={(event) => setMobileImageUrl(event.target.value)}
              className={inputClassName}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

type HeroImageControlProps = {
  label: string;
  hint: string;
  imageUrl: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onSelect: (file: File) => void;
};

function HeroImageControl({
  label,
  hint,
  imageUrl,
  inputRef,
  isUploading,
  onSelect,
}: HeroImageControlProps) {
  return (
    <div className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] p-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#dfe8e1]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${label} önizlemesi`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center text-xs font-semibold text-[#68746e]">
            Henüz görsel yüklenmedi
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-bold text-[#17201c]">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[#7a867f]">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="mt-3 w-full rounded-xl bg-[#173f32] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#10231d] disabled:opacity-60"
      >
        {isUploading ? "Yükleniyor..." : "Görsel Seç"}
      </button>
    </div>
  );
}
