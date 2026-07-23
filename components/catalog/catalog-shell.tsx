import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, getTelephoneHref } from "@/lib/siteSettings";

export async function CatalogShell({ children }: { children: React.ReactNode }) {
  const [cookieStore, siteSettings] = await Promise.all([
    cookies(),
    getSiteSettings(),
  ]);
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );
  const agent = agentId
    ? await prisma.user.findUnique({
        where: { id: agentId },
        select: { isActive: true, name: true },
      })
    : null;
  const isAgentLoggedIn = Boolean(agent?.isActive);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#17201c]">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      <header className="sticky top-0 z-40 border-b border-[#17201c]/10 bg-[#f4f1ea]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-10 lg:px-16">
          <Link href="/home" className="flex min-w-0 items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl shadow-md">
              <Image
                src="/logo.svg"
                alt="Lale EDT logo"
                fill
                priority
                sizes="44px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight sm:text-base">
                {siteSettings.companyName}
              </p>
              <p className="hidden text-[11px] uppercase tracking-[0.22em] text-[#63736b] sm:block">
                Ürün kataloğu
              </p>
            </div>
          </Link>

          <nav className="flex shrink-0 items-center gap-2">
            <Link
              href="/katalog"
              className="hidden rounded-full px-3 py-2 text-xs font-bold text-[#173f32] transition hover:bg-[#173f32]/8 sm:inline-flex"
            >
              Kategoriler
            </Link>
            {siteSettings.showAgentLogin && (
              <Link
                href={isAgentLoggedIn ? "/panel" : "/giris"}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#173f32] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d] sm:px-4"
              >
                {isAgentLoggedIn ? (
                  <>
                    <span className="hidden max-w-32 truncate normal-case tracking-normal sm:inline">
                      {agent?.name}
                    </span>
                    <span>Panele Git</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Giriş</span>
                    <span className="hidden sm:inline">Temsilci Girişi</span>
                  </>
                )}
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-10 lg:px-16">
        {children}
      </main>

      <footer className="relative mt-16 border-t border-[#17201c]/10 bg-[#f4f1ea]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/logo.svg"
                alt="Lale EDT logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-[#476057]">
              {siteSettings.companyName}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#89938e]">
            <a href={getTelephoneHref(siteSettings.primaryPhone)}>
              {siteSettings.primaryPhone}
            </a>
            <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
            <span>© {new Date().getFullYear()} Tüm hakları saklıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
