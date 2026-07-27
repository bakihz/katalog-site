import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { CatalogFooter } from "@/components/catalog/catalog-footer";

export async function CatalogShell({
  children,
  immersive = false,
}: {
  children: React.ReactNode;
  immersive?: boolean;
}) {
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
        logoUrl={siteSettings.logoUrl}
        companyName={siteSettings.companyName}
        email={siteSettings.email}
        showAgentLogin={siteSettings.showAgentLogin}
        agentName={isAgentLoggedIn ? agent?.name : null}
        immersive={immersive}
      />

      <main
        className={
          immersive
            ? "relative"
            : "relative mx-auto max-w-[94rem] px-4 py-8 sm:px-8 lg:px-12"
        }
      >
        {children}
      </main>

      <CatalogFooter
        logoUrl={siteSettings.logoUrl}
        companyName={siteSettings.companyName}
        primaryPhone={siteSettings.primaryPhone}
        email={siteSettings.email}
        address={siteSettings.address}
        mapsUrl={siteSettings.mapsUrl}
      />
    </div>
  );
}
