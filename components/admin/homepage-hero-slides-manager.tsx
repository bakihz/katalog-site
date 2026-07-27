"use client";

import { useRef, useState } from "react";
import type { HomepageHeroSlideView } from "@/lib/homepageHeroSlides";

type SlideState = HomepageHeroSlideView & {
  localKey: string;
};

type ImageVariant = "desktop" | "mobile";

type HomepageHeroSlidesManagerProps = {
  initialSlides: HomepageHeroSlideView[];
};

const inputClassName =
  "w-full rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2.5 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

function withLocalKey(
  slide: HomepageHeroSlideView,
  index: number,
): SlideState {
  return {
    ...slide,
    localKey: slide.id ? `slide-${slide.id}` : `legacy-${index}`,
  };
}

async function readJson<T>(response: Response) {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "İşlem tamamlanamadı.");
  }

  return payload;
}

export function HomepageHeroSlidesManager({
  initialSlides,
}: HomepageHeroSlidesManagerProps) {
  const [slides, setSlides] = useState(() =>
    initialSlides.map(withLocalKey),
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateSlide(
    localKey: string,
    changes: Partial<HomepageHeroSlideView>,
  ) {
    setSlides((current) =>
      current.map((slide) =>
        slide.localKey === localKey ? { ...slide, ...changes } : slide,
      ),
    );
  }

  async function persistSlide(slide: SlideState) {
    const response = await fetch(
      slide.id
        ? `/api/admin/homepage/hero-slides/${slide.id}`
        : "/api/admin/homepage/hero-slides",
      {
        method: slide.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slide),
      },
    );
    const payload = await readJson<{ slide: HomepageHeroSlideView }>(response);

    setSlides((current) =>
      current.map((entry) =>
        entry.localKey === slide.localKey
          ? { ...payload.slide, localKey: slide.localKey }
          : entry,
      ),
    );

    return payload.slide;
  }

  async function saveSlide(slide: SlideState) {
    setBusyKey(slide.localKey);
    setMessage(null);

    try {
      await persistSlide(slide);
      setMessage("Tanıtım kaydı kaydedildi.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Tanıtım kaydı kaydedilemedi.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function addSlide() {
    setBusyKey("add");
    setMessage(null);

    try {
      const legacySlide = slides.find((slide) => slide.id === null);

      if (legacySlide) {
        await persistSlide(legacySlide);
      }

      const response = await fetch("/api/admin/homepage/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Yeni tanıtım görseli",
          description: "",
          imageUrl: "",
          mobileImageUrl: "",
          buttonLabel: "Ürünleri Keşfet",
          buttonUrl: "/katalog",
          isActive: true,
        }),
      });
      const payload = await readJson<{ slide: HomepageHeroSlideView }>(response);

      setSlides((current) => [
        ...current.filter((slide) => slide.id !== null),
        withLocalKey(payload.slide, current.length),
      ]);
      setMessage("Yeni tanıtım kaydı eklendi.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Yeni tanıtım eklenemedi.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteSlide(slide: SlideState) {
    if (!slide.id || slides.length <= 1) return;
    if (!window.confirm(`“${slide.title}” tanıtım kaydı silinsin mi?`)) return;

    setBusyKey(slide.localKey);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/homepage/hero-slides/${slide.id}`,
        { method: "DELETE" },
      );
      await readJson<{ ok: boolean }>(response);
      setSlides((current) =>
        current.filter((entry) => entry.localKey !== slide.localKey),
      );
      setMessage("Tanıtım kaydı silindi.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Tanıtım kaydı silinemedi.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function moveSlide(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= slides.length ||
      slides.some((slide) => !slide.id)
    ) {
      return;
    }

    const reordered = [...slides];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    setSlides(reordered);
    setBusyKey("reorder");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/homepage/hero-slides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedIds: reordered.map((slide) => slide.id),
        }),
      });
      await readJson<{ ok: boolean }>(response);
      setMessage("Tanıtım sırası güncellendi.");
    } catch (error) {
      setSlides(slides);
      setMessage(
        error instanceof Error ? error.message : "Tanıtım sırası değiştirilemedi.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[#68746e]">
          Masaüstü ve mobil görselleri ayrı yükleyebilir, kayıtları yayından
          kaldırabilir ve gösterim sırasını değiştirebilirsiniz.
        </p>
        <button
          type="button"
          disabled={busyKey !== null}
          onClick={addSlide}
          className="rounded-xl bg-[#173f32] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#10231d] disabled:opacity-60"
        >
          {busyKey === "add" ? "Ekleniyor..." : "+ Yeni Tanıtım Ekle"}
        </button>
      </div>

      {message && (
        <p
          className="rounded-xl bg-[#edf1ec] px-3 py-2 text-xs font-semibold text-[#476057]"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <HeroSlideEditor
            key={slide.localKey}
            slide={slide}
            index={index}
            total={slides.length}
            isBusy={busyKey === slide.localKey}
            reorderBusy={busyKey === "reorder"}
            onChange={(changes) => updateSlide(slide.localKey, changes)}
            onSave={() => saveSlide(slide)}
            onDelete={() => deleteSlide(slide)}
            onMove={(direction) => moveSlide(index, direction)}
            onUpload={async (file, variant) => {
              setBusyKey(slide.localKey);
              setMessage(null);

              try {
                const storedSlide = slide.id
                  ? slide
                  : { ...slide, ...(await persistSlide(slide)) };
                const formData = new FormData();
                formData.append("image", file);
                formData.append("variant", variant);
                const response = await fetch(
                  `/api/admin/homepage/hero-slides/${storedSlide.id}/image`,
                  { method: "POST", body: formData },
                );
                const payload = await readJson<{ imageUrl: string }>(response);
                updateSlide(slide.localKey, {
                  [variant === "mobile" ? "mobileImageUrl" : "imageUrl"]:
                    payload.imageUrl,
                });
                setMessage(
                  variant === "mobile"
                    ? "Mobil görsel yüklendi."
                    : "Masaüstü görseli yüklendi.",
                );
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Tanıtım görseli yüklenemedi.",
                );
              } finally {
                setBusyKey(null);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

type HeroSlideEditorProps = {
  slide: SlideState;
  index: number;
  total: number;
  isBusy: boolean;
  reorderBusy: boolean;
  onChange: (changes: Partial<HomepageHeroSlideView>) => void;
  onSave: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onUpload: (file: File, variant: ImageVariant) => Promise<void>;
};

function HeroSlideEditor({
  slide,
  index,
  total,
  isBusy,
  reorderBusy,
  onChange,
  onSave,
  onDelete,
  onMove,
  onUpload,
}: HeroSlideEditorProps) {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  return (
    <article className="rounded-2xl border border-[#17201c]/10 bg-[#fbfaf7] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-white text-xs font-black text-[#173f32] shadow-sm">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-bold">Tanıtım {index + 1}</p>
            <p className="text-[11px] text-[#7a867f]">
              {slide.isActive ? "Yayında" : "Pasif"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Yukarı taşı"
            disabled={index === 0 || reorderBusy || !slide.id}
            onClick={() => onMove(-1)}
            className="grid size-9 place-items-center rounded-lg border border-[#17201c]/10 bg-white text-sm font-black disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="Aşağı taşı"
            disabled={index === total - 1 || reorderBusy || !slide.id}
            onClick={() => onMove(1)}
            className="grid size-9 place-items-center rounded-lg border border-[#17201c]/10 bg-white text-sm font-black disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HeroImageControl
          label="Masaüstü görseli"
          hint="Önerilen: 1920 × 1080, yatay WebP/JPG"
          imageUrl={slide.imageUrl}
          inputRef={desktopInputRef}
          isUploading={isBusy}
          onSelect={(file) => onUpload(file, "desktop")}
        />
        <HeroImageControl
          label="Mobil görsel"
          hint="Önerilen: 1080 × 1600, dikey WebP/JPG"
          imageUrl={slide.mobileImageUrl}
          inputRef={mobileInputRef}
          isUploading={isBusy}
          onSelect={(file) => onUpload(file, "mobile")}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Tanıtım başlığı
          </span>
          <textarea
            required
            maxLength={200}
            rows={3}
            value={slide.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder={"Profesyonel mutfakların\ngüvenilir tedarikçisi."}
            className={`${inputClassName} resize-y`}
          />
        </label>
        <label className="lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Kısa açıklama
          </span>
          <textarea
            maxLength={600}
            rows={3}
            value={slide.description ?? ""}
            onChange={(event) =>
              onChange({ description: event.target.value || null })
            }
            className={inputClassName}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Buton yazısı
          </span>
          <input
            maxLength={120}
            value={slide.buttonLabel ?? ""}
            onChange={(event) =>
              onChange({ buttonLabel: event.target.value || null })
            }
            placeholder="Ürünleri Keşfet"
            className={inputClassName}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-[#68746e]">
            Buton bağlantısı
          </span>
          <input
            maxLength={1000}
            value={slide.buttonUrl ?? ""}
            onChange={(event) =>
              onChange({ buttonUrl: event.target.value || null })
            }
            placeholder="/katalog"
            className={inputClassName}
          />
        </label>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-semibold text-[#476057]">
          Görsel bağlantılarını düzenle
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Masaüstü görsel URL
            </span>
            <input
              maxLength={1000}
              value={slide.imageUrl ?? ""}
              onChange={(event) =>
                onChange({ imageUrl: event.target.value || null })
              }
              className={inputClassName}
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#68746e]">
              Mobil görsel URL
            </span>
            <input
              maxLength={1000}
              value={slide.mobileImageUrl ?? ""}
              onChange={(event) =>
                onChange({ mobileImageUrl: event.target.value || null })
              }
              className={inputClassName}
            />
          </label>
        </div>
      </details>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#17201c]/10 pt-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={slide.isActive}
            onChange={(event) => onChange({ isActive: event.target.checked })}
            className="size-4 accent-[#173f32]"
          />
          Bu tanıtımı yayınla
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={total <= 1 || isBusy || !slide.id}
            onClick={onDelete}
            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
          >
            Sil
          </button>
          <button
            type="button"
            disabled={isBusy || !slide.title.trim()}
            onClick={onSave}
            className="rounded-xl bg-[#173f32] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#10231d] disabled:opacity-50"
          >
            {isBusy ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </article>
  );
}

type HeroImageControlProps = {
  label: string;
  hint: string;
  imageUrl: string | null;
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
    <div className="rounded-2xl border border-[#17201c]/10 bg-white p-3">
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
        className="mt-3 w-full rounded-xl bg-[#edf1ec] px-3 py-2 text-xs font-bold text-[#173f32] transition hover:bg-[#dfe8e1] disabled:opacity-60"
      >
        {isUploading ? "Yükleniyor..." : "Görsel Seç"}
      </button>
    </div>
  );
}
