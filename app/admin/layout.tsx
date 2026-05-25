import Link from "next/link";
import { headers } from "next/headers";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/payments", label: "Ödeme Kayıtları" },
  { href: "/admin/agents", label: "Temsilciler" },
  { href: "/admin/providers", label: "Sanal POS" },
  { href: "/admin/import", label: "Ürün İçe Aktarma" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Login sayfasında sidebar gösterme
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-neutral-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-700">
          <span className="text-lg font-bold tracking-wide">
            Yönetim Paneli
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-700 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            ← Ana Sayfa
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors"
            >
              ⏻ Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 overflow-auto">
        {children}
      </main>
    </div>
  );
}
