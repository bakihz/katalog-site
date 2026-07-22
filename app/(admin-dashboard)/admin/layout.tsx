import { DashboardNavLink, DashboardShell } from "@/components/layout";

const adminNavLinks: DashboardNavLink[] = [
  { href: "/admin", label: "Özet", icon: "📊", exact: true },
  { href: "/admin/payments", label: "Ödemeler", icon: "💳" },
  { href: "/admin/agents", label: "Temsilciler", icon: "👥" },
  { href: "/admin/products", label: "Ürünler", icon: "🧾" },
  { href: "/admin/categories", label: "Kategoriler", icon: "🗂️" },
  { href: "/admin/import", label: "Ürün Aktar", icon: "📦" },
  { href: "/admin/providers", label: "Sanal POS", icon: "🏦" },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
