"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/payments", label: "Ödemeler", icon: "💳" },
  { href: "/admin/agents", label: "Temsilciler", icon: "👥" },
  { href: "/admin/providers", label: "Sanal POS", icon: "🏦" },
  { href: "/admin/import", label: "Ürün Aktar", icon: "📦" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(href);
}

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-4 py-6">
      {navLinks.map((link) => {
        const active = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
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

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {navLinks.map((link) => {
        const active = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#10231d] text-white"
                : "bg-white text-[#5d6963] hover:text-[#10231d]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
