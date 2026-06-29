import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import {
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  SUCCESSFUL_PAYMENT_STATUSES,
} from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
}

export default async function PanelDashboardPage() {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPayments, paidPayments, todayPayments, recentPayments] =
    await Promise.all([
      prisma.payment.count({ where: { agentId } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { agentId, status: { in: [...SUCCESSFUL_PAYMENT_STATUSES] } },
      }),
      prisma.payment.count({
        where: { agentId, createdAt: { gte: today } },
      }),
      prisma.payment.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const cards = [
    {
      label: "Toplam İşlem",
      value: totalPayments.toLocaleString("tr-TR"),
      hint: "Tüm zamanlar",
      icon: "🧾",
    },
    {
      label: "Tahsil Edilen",
      value: formatMoney(paidPayments._sum.amount ?? 0),
      hint: "Başarılı ödemeler",
      icon: "₺",
    },
    {
      label: "Bugünkü İşlem",
      value: todayPayments.toLocaleString("tr-TR"),
      hint: "Bugün oluşturulan kayıt",
      icon: "📅",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-xl shadow-[#10231d]/10 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c2853e]">
              Dashboard
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Temsilci özeti
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68746e]">
              Sadece size ait tahsilat kayıtları ve son işlemler burada
              görüntülenir.
            </p>
          </div>

          <Link
            href="/panel/odeme"
            className="inline-flex items-center justify-center rounded-2xl bg-[#10231d] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#10231d]/20 transition hover:bg-[#173f32]"
          >
            + Ödeme Al
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-6 shadow-lg shadow-[#10231d]/5"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#edf1ec] text-lg text-[#173f32]">
                {card.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938e]">
                {card.hint}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#68746e]">{card.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">
              {card.value}
            </p>
          </div>
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
          <Link
            href="/panel/islemler"
            className="shrink-0 rounded-full border border-[#17201c]/10 px-4 py-2 text-sm font-semibold text-[#173f32] transition hover:border-[#173f32]/30 hover:bg-[#edf1ec]"
          >
            Tümünü Gör
          </Link>
        </div>

        {recentPayments.length === 0 ? (
          <p className="p-6 text-sm text-[#68746e]">Henüz işlem bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-[#f8f6f1]">
                <tr>
                  {["Müşteri", "Tutar", "Durum", "Tarih", ""].map((head) => (
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
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${getPaymentStatusBadgeClass(
                          payment.status,
                        )}`}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {new Date(payment.createdAt).toLocaleString("tr-TR")}
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
