"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/panel", label: "Dashboard", icon: "📊" },
  { href: "/panel/odeme", label: "Ödeme Al", icon: "💳" },
  { href: "/panel/islemler", label: "İşlemlerim", icon: "🧾" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/panel") {
    return pathname === "/panel";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PanelSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-4 py-5">
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);

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
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PanelMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#10231d] text-white"
                : "border border-[#17201c]/10 bg-white text-[#5d6963]"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
