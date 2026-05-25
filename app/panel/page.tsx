import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
        where: { agentId, status: "Paid" },
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
    },
    {
      label: "Tahsil Edilen",
      value: (paidPayments._sum.amount ?? 0).toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
      }),
    },
    {
      label: "Bugünkü İşlem",
      value: todayPayments.toLocaleString("tr-TR"),
    },
  ];

  const statusLabel: Record<string, string> = {
    Paid: "Başarılı",
    Failed: "Başarısız",
    Pending: "Bekliyor",
  };

  const statusColor: Record<string, string> = {
    Paid: "text-green-600",
    Failed: "text-red-500",
    Pending: "text-yellow-500",
  };

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/panel/odeme"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-500 transition-colors"
        >
          + Ödeme Al
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Son İşlemler</h2>
          <Link
            href="/panel/islemler"
            className="text-sm text-blue-600 hover:underline"
          >
            Tümünü Gör
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {recentPayments.length === 0 ? (
            <p className="p-6 text-neutral-400 text-sm">
              Henüz işlem bulunmuyor.
            </p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-neutral-500">
                    Müşteri
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-neutral-500">
                    Tutar
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-neutral-500">
                    Durum
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-neutral-500">
                    Tarih
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="px-6 py-3 text-sm">{p.customerName}</td>
                    <td className="px-6 py-3 text-sm font-medium">
                      {p.amount.toLocaleString("tr-TR")} TL
                    </td>
                    <td
                      className={`px-6 py-3 text-sm font-medium ${statusColor[p.status] ?? ""}`}
                    >
                      {statusLabel[p.status] ?? p.status}
                    </td>
                    <td className="px-6 py-3 text-sm text-neutral-500">
                      {new Date(p.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-3">
                      {p.status === "Paid" && (
                        <Link
                          href={`/panel/dekont/${p.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Dekont
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
