import { SUCCESSFUL_PAYMENT_STATUSES } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import {
  AppButton,
  PageHeader,
  PaymentStatusBadge,
  StatCard,
} from "@/components/ui";
import Link from "next/link";

async function getStats() {
  const [
    totalProducts,
    totalPayments,
    successPayments,
    activeProvider,
    agents,
    recentPayments,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.payment.count(),
    prisma.payment.count({
      where: { status: { in: [...SUCCESSFUL_PAYMENT_STATUSES] } },
    }),
    prisma.paymentProvider.findFirst({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { agent: { select: { name: true } } },
    }),
  ]);

  const revenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: { in: [...SUCCESSFUL_PAYMENT_STATUSES] } },
  });

  return {
    totalProducts,
    totalPayments,
    successPayments,
    activeProvider: activeProvider?.name ?? "Tanımlı değil",
    agents,
    recentPayments,
    revenue: revenue._sum.amount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Toplam Ürün",
      value: formatNumber(stats.totalProducts),
      helper: "Katalogdaki kayıt sayısı",
      accent: "bg-[#173f32]",
    },
    {
      label: "Toplam Ödeme",
      value: formatNumber(stats.totalPayments),
      helper: "Tüm işlem kayıtları",
      accent: "bg-[#c2853e]",
    },
    {
      label: "Başarılı Ödeme",
      value: formatNumber(stats.successPayments),
      helper: "Tahsil edilmiş görünen işlemler",
      accent: "bg-emerald-600",
    },
    {
      label: "Toplam Ciro",
      value: formatCurrency(stats.revenue),
      helper: "Başarılı ödemeler toplamı",
      accent: "bg-blue-600",
    },
  ];

  const shortcuts = [
    {
      href: "/admin/payments",
      title: "Ödeme kayıtları",
      text: "Tahsilatları ve işlem durumlarını incele.",
    },
    {
      href: "/admin/agents",
      title: "Temsilciler",
      text: "Yeni temsilci ekle veya aktif/pasif yap.",
    },
    {
      href: "/admin/import",
      title: "Ürün aktarımı",
      text: "CSV ile ürün kataloğunu güncelle.",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        variant="hero"
        eyebrow="Genel Bakış"
        title="Lale EDT operasyonlarını tek ekrandan takip et."
        description="Ürün kataloğu, temsilciler, sanal POS ve ödeme kayıtları için hızlı erişim alanı."
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Aktif POS
            </p>
            <p className="mt-1 text-xl font-bold">{stats.activeProvider}</p>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            accentClassName={card.accent}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Son ödeme kayıtları
              </h2>
              <p className="mt-1 text-sm text-[#7a867f]">
                En yeni 5 işlem listelenir.
              </p>
            </div>
            <AppButton href="/admin/payments" size="md">
              Tümü
            </AppButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[#17201c]/10 text-xs uppercase tracking-[0.14em] text-[#89938e]">
                  <th className="py-3 pr-4">Müşteri</th>
                  <th className="py-3 pr-4">Temsilci</th>
                  <th className="py-3 pr-4">Tutar</th>
                  <th className="py-3 pr-4">Durum</th>
                  <th className="py-3">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17201c]/8">
                {stats.recentPayments.length === 0 ? (
                  <tr>
                    <td className="py-6 text-sm text-[#7a867f]" colSpan={5}>
                      Henüz ödeme kaydı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  stats.recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-4 pr-4 font-semibold">
                        {payment.customerName}
                      </td>
                      <td className="py-4 pr-4 text-sm text-[#68746e]">
                        {payment.agent?.name ?? "Genel"}
                      </td>
                      <td className="py-4 pr-4 text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-4 pr-4">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="py-4 text-sm text-[#68746e]">
                        {formatDateTime(payment.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <StatCard
            label="Temsilci Sayısı"
            value={formatNumber(stats.agents)}
            helper="Aktif/pasif yönetimi temsilciler ekranında."
          />

          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="block rounded-[1.5rem] border border-[#17201c]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#173f32]/25 hover:shadow-lg"
            >
              <p className="text-lg font-bold">{shortcut.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#68746e]">
                {shortcut.text}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
