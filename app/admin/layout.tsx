import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { AdminMobileNav, AdminSidebarNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#17201c]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[#17201c]/10 bg-[#10231d] text-white shadow-2xl shadow-[#10231d]/20 lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl shadow-lg shadow-black/20">
            <Image
              src="/logo.svg"
              alt="Lale EDT logo"
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
              Lale EDT
            </p>
            <p className="text-lg font-bold tracking-tight">Yönetim Paneli</p>
          </div>
        </div>

        <AdminSidebarNav />

        <div className="space-y-2 border-t border-white/10 px-4 py-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Siteye Dön
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-200 transition hover:bg-red-500 hover:text-white"
            >
              <span aria-hidden="true">⏻</span>
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#17201c]/10 bg-[#f5f3ee]/90 px-4 py-4 backdrop-blur md:px-8 lg:px-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a867f]">
                  Admin
                </p>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Operasyon Merkezi
                </h1>
              </div>
              <Link
                href="/"
                className="rounded-full border border-[#17201c]/10 bg-white px-4 py-2 text-sm font-semibold text-[#17201c] shadow-sm transition hover:border-[#173f32]/25 hover:text-[#c2853e] lg:hidden"
              >
                Site
              </Link>
            </div>

            <AdminMobileNav />
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] px-4 py-6 md:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
