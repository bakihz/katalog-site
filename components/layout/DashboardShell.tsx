import Image from "next/image";
import Link from "next/link";
import {
  DashboardMobileNav,
  DashboardMobileMenu,
  DashboardNavLink,
  DashboardSidebarNav,
} from "./DashboardNav";

type DashboardShellProps = {
  children: React.ReactNode;
  navLinks: DashboardNavLink[];
  sidebarTitle: string;
  headerEyebrow: string;
  headerTitle: string;
  logoutAction: string;
  userName?: string | null;
  showMobileNavIcons?: boolean;
};

export function DashboardShell({
  children,
  navLinks,
  sidebarTitle,
  headerEyebrow,
  headerTitle,
  logoutAction,
  userName,
  showMobileNavIcons = false,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#17201c]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[#17201c]/10 bg-[#10231d] text-white shadow-2xl shadow-[#10231d]/20 lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
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
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
                Lale EDT
              </p>
              <p className="text-lg font-bold tracking-tight">
                {sidebarTitle}
              </p>
              {userName && (
                <p className="mt-1 truncate text-sm text-white/55">
                  {userName}
                </p>
              )}
            </div>
          </div>
        </div>

        <DashboardSidebarNav links={navLinks} />

        <div className="space-y-2 border-t border-white/10 px-4 py-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Siteye Dön
          </Link>
          <form action={logoutAction} method="POST">
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
                  {headerEyebrow}
                </p>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {headerTitle}
                </h1>
                {userName && (
                  <p className="mt-1 text-sm text-[#68746e] lg:hidden">
                    {userName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href="/"
                  className="rounded-full border border-[#17201c]/10 bg-white px-4 py-2 text-sm font-semibold text-[#17201c] shadow-sm transition hover:border-[#173f32]/25 hover:text-[#c2853e]"
                >
                  Site
                </Link>
                <DashboardMobileMenu
                  links={navLinks}
                  logoutAction={logoutAction}
                  sidebarTitle={sidebarTitle}
                  userName={userName}
                />
              </div>
            </div>

            <DashboardMobileNav
              links={navLinks}
              showIcons={showMobileNavIcons}
            />
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] px-4 py-6 md:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
