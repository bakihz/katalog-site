import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  Paid: "Başarılı",
  Failed: "Başarısız",
  Pending: "Bekliyor",
};

const statusColor: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default async function IslemlerPage() {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const payments = await prisma.payment.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">İşlemlerim</h1>
        <span className="text-sm text-neutral-500">
          Toplam tahsilat:{" "}
          <strong>
            {totalPaid.toLocaleString("tr-TR", {
              style: "currency",
              currency: "TRY",
            })}
          </strong>
        </span>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {payments.length === 0 ? (
          <p className="p-6 text-neutral-400 text-sm">
            Henüz işlem bulunmuyor.
          </p>
        ) : (
          <table className="w-full">
            <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Müşteri
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Firma
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Açıklama
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Tutar
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Durum
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Tarih
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-6 py-3 text-sm font-medium">
                    {p.customerName}
                  </td>
                  <td className="px-6 py-3 text-sm text-neutral-500">
                    {p.companyName ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-neutral-500 max-w-[200px] truncate">
                    {p.description ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold">
                    {p.amount.toLocaleString("tr-TR")} TL
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[p.status] ?? ""}`}
                    >
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-neutral-500 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-6 py-3">
                    {p.status === "Paid" && (
                      <Link
                        href={`/panel/dekont/${p.id}`}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap"
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
  );
}
