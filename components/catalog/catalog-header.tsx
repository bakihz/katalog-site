"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type CatalogHeaderProps = {
  companyName: string;
  email: string;
  showAgentLogin: boolean;
  agentName?: string | null;
};

const navigationItems = [
  { href: "/home", label: "Ana Sayfa", match: "home" },
  { href: "/katalog", label: "Kategoriler", match: "catalog" },
  { href: "/urunler", label: "Ürünler", match: "products" },
  { href: "/home#hakkimizda", label: "Hakkımızda", match: "about" },
] as const;

export function CatalogHeader({
  companyName,
  email,
  showAgentLogin,
  agentName,
}: CatalogHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const agentHref = agentName ? "/panel" : "/giris";

  function isActive(match: (typeof navigationItems)[number]["match"]) {
    if (match === "home") return pathname === "/home";
    if (match === "catalog") return pathname.startsWith("/katalog");
    if (match === "products") {
      return pathname === "/urunler" || pathname.startsWith("/urun/");
    }
    return false;
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      <div className="relative mx-auto max-w-[94rem] rounded-[1.4rem] border border-white/60 bg-[rgba(255,255,255,0.68)] shadow-[0_16px_50px_rgba(16,35,29,0.12)] backdrop-blur-[26px] backdrop-saturate-150">
        <div className="flex h-[4.5rem] items-center gap-4 px-4 sm:h-[5rem] sm:px-5 lg:px-7">
          <Link
            href="/home"
            aria-label={`${companyName} ana sayfa`}
            className="relative z-10 flex shrink-0 items-center gap-3"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="relative block size-12 overflow-hidden rounded-xl sm:size-14">
              <Image
                src="/logo.svg"
                alt="Lale EDT logo"
                fill
                priority
                sizes="56px"
                className="object-contain"
              />
            </span>
            <span className="hidden max-w-36 text-sm font-black leading-tight text-[#173f32] xl:block">
              {companyName}
            </span>
          </Link>

          <nav
            aria-label="Ana menü"
            className="hidden min-w-0 flex-1 items-stretch justify-center self-stretch md:flex"
          >
            {navigationItems.map((item) => {
              const active = isActive(item.match);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center px-3 text-sm font-bold transition lg:px-5 ${
                    active
                      ? "text-[#10231d]"
                      : "text-[#4f5d56] hover:text-[#10231d]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-1 rounded-t-full bg-[#c2853e] transition lg:inset-x-5 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center rounded-full bg-[#efb44f] px-5 py-3 text-sm font-black text-[#2a2114] transition hover:bg-[#f5c466]"
            >
              İletişim
            </a>
            {showAgentLogin && (
              <Link
                href={agentHref}
                className="inline-flex max-w-48 items-center justify-center gap-2 rounded-full bg-[#173f32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#10231d]"
              >
                {agentName ? (
                  <>
                    <span className="max-w-24 truncate">{agentName}</span>
                    <span className="text-white/55">•</span>
                    <span>Panel</span>
                  </>
                ) : (
                  "Temsilci Girişi"
                )}
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#efb44f] text-[#17201c] transition hover:bg-[#f5c466] md:hidden"
          >
            <span className="relative block size-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current transition ${
                  isMenuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2.5 h-0.5 w-5 rounded-full bg-current transition ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-5 rounded-full bg-current transition ${
                  isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <div
          className={`absolute left-0 right-0 top-[calc(100%+0.55rem)] origin-top overflow-hidden rounded-[1.4rem] border border-white/65 bg-[rgba(255,255,255,0.82)] shadow-[0_24px_60px_rgba(16,35,29,0.18)] backdrop-blur-[26px] backdrop-saturate-150 transition duration-300 md:hidden ${
            isMenuOpen
              ? "visible translate-y-0 scale-y-100 opacity-100"
              : "invisible -translate-y-2 scale-y-95 opacity-0"
          }`}
        >
          <nav
            aria-label="Mobil menü"
            className="flex min-h-[28rem] max-h-[calc(100dvh-7rem)] flex-col overflow-y-auto p-5"
          >
            <div>
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between border-b border-[#17201c]/10 py-4 text-base font-bold text-[#17201c]"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-xl font-normal">
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              <a
                href={`mailto:${email}`}
                className="rounded-full bg-[#efb44f] px-5 py-3 text-sm font-black text-[#2a2114]"
              >
                İletişim
              </a>
              {showAgentLogin && (
                <Link
                  href={agentHref}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full bg-[#173f32] px-5 py-3 text-sm font-bold text-white"
                >
                  {agentName ? "Temsilci Paneli" : "Temsilci Girişi"}
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
