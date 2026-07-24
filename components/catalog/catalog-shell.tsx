import Image from "next/image";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, getTelephoneHref } from "@/lib/siteSettings";
import { CatalogHeader } from "@/components/catalog/catalog-header";

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
    <div className="min-h-screen overflow-x-clip bg-[#f4f1ea] text-[#17201c]">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      <CatalogHeader
        companyName={siteSettings.companyName}
        email={siteSettings.email}
        showAgentLogin={siteSettings.showAgentLogin}
        agentName={isAgentLoggedIn ? agent?.name : null}
      />

      <main className="relative mx-auto max-w-[94rem] px-4 py-8 sm:px-8 lg:px-12">
        {children}
      </main>

      <footer
        id="iletisim"
        className="relative mt-16 border-t border-[#17201c]/10 bg-[#f4f1ea]/80"
      >
        <div className="mx-auto flex max-w-[94rem] flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
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
