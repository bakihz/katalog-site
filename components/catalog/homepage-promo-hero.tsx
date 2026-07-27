"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomepageHeroSlideView } from "@/lib/homepageHeroSlides";

type HomepagePromoHeroProps = {
  companyName: string;
  slides: HomepageHeroSlideView[];
  autoplayMs?: number;
};

export function HomepagePromoHero({
  companyName,
  slides,
  autoplayMs = 7000,
}: HomepagePromoHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const hasMultipleSlides = slides.length > 1;

  const showSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (!hasMultipleSlides || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % slides.length),
      autoplayMs,
    );

    return () => window.clearInterval(timer);
  }, [autoplayMs, hasMultipleSlides, isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-label="Tanıtım görselleri"
      aria-roledescription="carousel"
      className="relative min-h-[100svh] overflow-hidden bg-[#173f32] text-white lg:min-h-[min(58rem,100svh)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;

        if (startX === null || endX === undefined) return;
        const distance = endX - startX;
        if (Math.abs(distance) < 45) return;
        showSlide(activeIndex + (distance < 0 ? 1 : -1));
      }}
    >
      {slides.map((slide, index) => {
        const fallbackImageUrl = slide.imageUrl || slide.mobileImageUrl;
        const isActive = index === activeIndex;
        const titleClassName =
          "mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-balance [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl";

        return (
          <article
            key={slide.id ?? `hero-${index}`}
            aria-hidden={!isActive}
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${slides.length}`}
            className={`absolute inset-0 flex transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
              isActive
                ? "z-10 translate-x-0 opacity-100"
                : "pointer-events-none z-0 translate-x-[2%] opacity-0"
            }`}
          >
            {fallbackImageUrl ? (
              <picture className="absolute inset-0">
                {slide.mobileImageUrl && (
                  <source
                    media="(max-width: 639px)"
                    srcSet={slide.mobileImageUrl}
                  />
                )}
                <img
                  src={fallbackImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </picture>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(239,180,79,0.5),transparent_27%),linear-gradient(135deg,#10231d_0%,#1d4d3d_54%,#c2853e_135%)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#071913]/90 via-[#071913]/20 to-[#071913]/20 sm:bg-gradient-to-r sm:from-[#071913]/80 sm:via-[#071913]/25 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#071913]/20 via-transparent to-[#071913]/35" />

            <div className="relative mx-auto flex w-full max-w-[94rem] items-end px-5 pb-20 pt-32 sm:px-8 sm:pb-20 sm:pt-40 lg:px-12 lg:pb-24">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#f3c98f] sm:text-sm">
                  {companyName}
                </p>
                {index === 0 ? (
                  <h1 className={titleClassName}>{slide.title}</h1>
                ) : (
                  <h2 className={titleClassName}>{slide.title}</h2>
                )}
                {slide.description && (
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-lg sm:leading-8">
                    {slide.description}
                  </p>
                )}
                {slide.buttonLabel && slide.buttonUrl && (
                  <Link
                    href={slide.buttonUrl}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#efb44f] px-6 py-3.5 text-sm font-black text-[#2a2114] shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:bg-[#f5c466]"
                  >
                    {slide.buttonLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {hasMultipleSlides && (
        <div className="absolute inset-x-0 bottom-7 z-20 mx-auto flex w-full max-w-[94rem] items-center justify-between gap-4 px-5 sm:bottom-9 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id ?? `dot-${index}`}
                type="button"
                aria-label={`${index + 1}. tanıtımı göster`}
                aria-current={index === activeIndex}
                onClick={() => showSlide(index)}
                className={`h-2.5 rounded-full border border-white/45 transition-all ${
                  index === activeIndex
                    ? "w-9 bg-white"
                    : "w-2.5 bg-white/30 hover:bg-white/65"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Önceki tanıtım"
              onClick={() => showSlide(activeIndex - 1)}
              className="grid size-11 place-items-center rounded-full border border-white/35 bg-[#10231d]/35 text-xl font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-[#173f32]"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Sonraki tanıtım"
              onClick={() => showSlide(activeIndex + 1)}
              className="grid size-11 place-items-center rounded-full border border-white/35 bg-[#10231d]/35 text-xl font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-[#173f32]"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
