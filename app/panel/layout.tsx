import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";
import { DashboardNavLink, DashboardShell } from "@/components/layout";

const panelNavLinks: DashboardNavLink[] = [
  { href: "/panel", label: "Dashboard", icon: "📊", exact: true },
  { href: "/panel/odeme", label: "Ödeme Al", icon: "💳" },
  { href: "/panel/islemler", label: "İşlemlerim", icon: "🧾" },
  { href: "/panel/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );
  const agent = agentId
    ? await prisma.user.findUnique({
        where: { id: agentId },
        select: { name: true },
      })
    : null;

  return (
    <DashboardShell
      navLinks={panelNavLinks}
      sidebarTitle="Temsilci Paneli"
      headerEyebrow="Temsilci"
      headerTitle="Tahsilat Merkezi"
      logoutAction="/api/agent/logout"
      userName={agent?.name}
      showMobileNavIcons
    >
      {children}
    </DashboardShell>
  );
}
