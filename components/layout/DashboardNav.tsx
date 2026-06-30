"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";

export type DashboardNavLink = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
};

function isActivePath(pathname: string, link: DashboardNavLink) {
  if (link.exact) {
    return pathname === link.href;
  }

  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function DashboardSidebarNav({
  links,
}: {
  links: DashboardNavLink[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-4 py-6">
      {links.map((link) => {
        const active = isActivePath(pathname, link);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active
                ? "bg-white text-[#10231d] shadow-lg shadow-black/10"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span aria-hidden="true" className="text-base">
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardMobileNav({
  links,
  showIcons = false,
}: {
  links: DashboardNavLink[];
  showIcons?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {links.map((link) => {
        const active = isActivePath(pathname, link);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#10231d] text-white"
                : "border border-[#17201c]/10 bg-white text-[#5d6963] hover:text-[#10231d]"
            }`}
          >
            {showIcons ? `${link.icon} ` : ""}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardMobileMenu({
  links,
  logoutAction,
  sidebarTitle,
  userName,
}: {
  links: DashboardNavLink[];
  logoutAction: string;
  sidebarTitle: string;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[#10231d] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#173f32] lg:hidden"
        aria-label="Menüyü aç"
        aria-expanded={isOpen}
      >
        <span className="text-lg leading-none" aria-hidden="true">
          ☰
        </span>
        Menü
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] lg:hidden">
              <button
                type="button"
                aria-label="Menüyü kapat"
                className="absolute inset-0 bg-black/45"
                onClick={() => setIsOpen(false)}
              />

              <aside className="relative flex h-dvh w-[min(84vw,22rem)] flex-col bg-[#10231d] text-white shadow-2xl">
                <div className="border-b border-white/10 px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                        Lale EDT
                      </p>
                      <p className="mt-1 text-xl font-black">
                        {sidebarTitle}
                      </p>
                      {userName && (
                        <p className="mt-1 text-sm text-white/60">
                          {userName}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold transition hover:bg-white/20"
                      aria-label="Menüyü kapat"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-5">
                  {links.map((link) => {
                    const active = isActivePath(pathname, link);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          active
                            ? "bg-white text-[#10231d] shadow-lg shadow-black/10"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span aria-hidden="true" className="text-base">
                          {link.icon}
                        </span>
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="space-y-2 border-t border-white/10 px-4 py-5">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                  >
                    <span aria-hidden="true">←</span>
                    Siteye Dön
                  </Link>
                  <form action={logoutAction} method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-left text-sm font-bold text-red-100 transition hover:bg-red-500 hover:text-white"
                    >
                      <span aria-hidden="true">⏻</span>
                      Çıkış Yap
                    </button>
                  </form>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
