import { headers } from "next/headers";
import { DashboardNavLink, DashboardShell } from "@/components/layout";

const adminNavLinks: DashboardNavLink[] = [
  { href: "/admin", label: "Özet", icon: "📊", exact: true },
  { href: "/admin/payments", label: "Ödemeler", icon: "💳" },
  { href: "/admin/agents", label: "Temsilciler", icon: "👥" },
  { href: "/admin/providers", label: "Sanal POS", icon: "🏦" },
  { href: "/admin/import", label: "Ürün Aktar", icon: "📦" },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙️" },
];

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
    <DashboardShell
      navLinks={adminNavLinks}
      sidebarTitle="Yönetim Paneli"
      headerEyebrow="Admin"
      headerTitle="Yönetim Merkezi"
      logoutAction="/api/admin/logout"
    >
      {children}
    </DashboardShell>
  );
}
