import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { getPaymentCardMasked } from "@/lib/paymentCard";
import { SUCCESSFUL_PAYMENT_STATUSES } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { canViewAllPayments } from "@/lib/userRole";
import { AppButton, PageHeader, PaymentStatusBadge, StatCard } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PanelDashboardPage() {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const currentUser = await prisma.user.findUnique({ where: { id: agentId } });
  const canViewAll = canViewAllPayments(currentUser);
  const paymentScope = canViewAll ? {} : { agentId };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPayments, paidPayments, todayPayments, recentPayments] =
    await Promise.all([
      prisma.payment.count({ where: paymentScope }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          ...paymentScope,
          status: { in: [...SUCCESSFUL_PAYMENT_STATUSES] },
        },
      }),
      prisma.payment.count({
        where: { ...paymentScope, createdAt: { gte: today } },
      }),
      prisma.payment.findMany({
        where: paymentScope,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const cards = [
    {
      label: "Toplam İşlem",
      value: formatNumber(totalPayments),
      hint: "Tüm zamanlar",
      icon: "🧾",
    },
    {
      label: "Tahsil Edilen",
      value: formatCurrency(paidPayments._sum.amount ?? 0),
      hint: "Başarılı ödemeler",
      icon: "₺",
    },
    {
      label: "Bugünkü İşlem",
      value: formatNumber(todayPayments),
      hint: "Bugün oluşturulan kayıt",
      icon: "📅",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={canViewAll ? "Finans özeti" : "Temsilci özeti"}
        description={
          canViewAll
            ? "Tüm temsilcilerin tahsilat kayıtları ve son işlemleri burada görüntülenir."
            : "Sadece size ait tahsilat kayıtları ve son işlemler burada görüntülenir."
        }
        actions={
          <AppButton href="/panel/odeme" size="lg">
            + Ödeme Al
          </AppButton>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            className="shadow-lg shadow-[#10231d]/5"
          />
        ))}
      </section>

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white shadow-xl shadow-[#10231d]/10">
        <div className="flex items-center justify-between gap-4 border-b border-[#17201c]/10 p-6">
          <div>
            <h2 className="text-xl font-bold">Son İşlemler</h2>
            <p className="mt-1 text-sm text-[#68746e]">
              En son oluşturduğunuz tahsilat kayıtları.
            </p>
          </div>
          <AppButton href="/panel/islemler" variant="outline" size="md">
            Tümünü Gör
          </AppButton>
        </div>

        {recentPayments.length === 0 ? (
          <p className="p-6 text-sm text-[#68746e]">Henüz işlem bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-[#f8f6f1]">
                <tr>
                  {["Firma / Cari", "Kart", "Tutar", "Durum", "Tarih", ""].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#7a867f]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-t border-[#17201c]/8 align-middle"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">
                      {payment.companyName || payment.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {getPaymentCardMasked(payment) ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {formatDateTime(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === "Paid" && (
                        <Link
                          href={`/panel/dekont/${payment.id}`}
                          className="rounded-full bg-[#10231d] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#173f32]"
                        >
                          Dekont
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
