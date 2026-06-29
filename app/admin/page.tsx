import { prisma } from "@/lib/prisma";
import {
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  SUCCESSFUL_PAYMENT_STATUSES,
} from "@/lib/paymentStatus";
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

function formatMoney(amount: number) {
  return amount.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Toplam Ürün",
      value: stats.totalProducts.toLocaleString("tr-TR"),
      helper: "Katalogdaki kayıt sayısı",
      accent: "bg-[#173f32]",
    },
    {
      label: "Toplam Ödeme",
      value: stats.totalPayments.toLocaleString("tr-TR"),
      helper: "Tüm işlem kayıtları",
      accent: "bg-[#c2853e]",
    },
    {
      label: "Başarılı Ödeme",
      value: stats.successPayments.toLocaleString("tr-TR"),
      helper: "Tahsil edilmiş görünen işlemler",
      accent: "bg-emerald-600",
    },
    {
      label: "Toplam Ciro",
      value: formatMoney(stats.revenue),
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
      <section className="overflow-hidden rounded-[2rem] bg-[#10231d] p-6 text-white shadow-2xl shadow-[#10231d]/15 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Genel Bakış
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Lale EDT operasyonlarını tek ekrandan takip et.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65 md:text-base">
              Ürün kataloğu, temsilciler, sanal POS ve ödeme kayıtları için hızlı
              erişim alanı.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Aktif POS
            </p>
            <p className="mt-1 text-xl font-bold">{stats.activeProvider}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-6 shadow-sm"
          >
            <div className={`mb-5 h-1.5 w-14 rounded-full ${card.accent}`} />
            <p className="text-sm font-medium text-[#68746e]">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-[#7a867f]">{card.helper}</p>
          </div>
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
            <Link
              href="/admin/payments"
              className="rounded-full bg-[#10231d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173f32]"
            >
              Tümü
            </Link>
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
                        {formatMoney(payment.amount)}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPaymentStatusBadgeClass(
                            payment.status,
                          )}`}
                        >
                          {getPaymentStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-[#68746e]">
                        {new Date(payment.createdAt).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#68746e]">Temsilci Sayısı</p>
            <p className="mt-2 text-3xl font-bold">
              {stats.agents.toLocaleString("tr-TR")}
            </p>
            <p className="mt-2 text-sm text-[#7a867f]">
              Aktif/pasif yönetimi temsilciler ekranında.
            </p>
          </div>

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
