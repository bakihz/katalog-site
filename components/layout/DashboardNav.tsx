"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
