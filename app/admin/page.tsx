import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalProducts, totalPayments, successPayments, activeProvider] =
    await Promise.all([
      prisma.product.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "success" } }),
      prisma.paymentProvider.findFirst({ where: { isActive: true } }),
    ]);

  const revenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "success" },
  });

  return {
    totalProducts,
    totalPayments,
    successPayments,
    activeProvider: activeProvider?.name ?? "—",
    revenue: revenue._sum.amount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Toplam Ürün",
      value: stats.totalProducts.toLocaleString("tr-TR"),
    },
    {
      label: "Toplam Ödeme",
      value: stats.totalPayments.toLocaleString("tr-TR"),
    },
    {
      label: "Başarılı Ödeme",
      value: stats.successPayments.toLocaleString("tr-TR"),
    },
    {
      label: "Toplam Ciro",
      value: stats.revenue.toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
      }),
    },
    { label: "Aktif POS", value: stats.activeProvider },
  ];

  const shortcuts = [
    { href: "/admin/payments", label: "Ödemeleri Gör" },
    { href: "/admin/providers", label: "POS Yönetimi" },
    { href: "/admin/import", label: "Ürün İçe Aktar" },
  ];

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800"
          >
            <p className="text-sm text-neutral-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Hızlı Erişim</h2>
        <div className="flex flex-wrap gap-3">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
