import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import {
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  isSuccessfulPaymentStatus,
} from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
}

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
    .filter((p) => isSuccessfulPaymentStatus(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-xl shadow-[#10231d]/10 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c2853e]">
              İşlemlerim
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Tahsilat kayıtları
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68746e]">
              Bu listede yalnızca sizin hesabınızla oluşturulan işlemler
              gösterilir.
            </p>
          </div>

          <div className="rounded-2xl bg-[#edf1ec] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a867f]">
              Toplam Tahsilat
            </p>
            <p className="mt-1 text-xl font-bold text-[#10231d]">
              {formatMoney(totalPaid)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white shadow-xl shadow-[#10231d]/10">
        {payments.length === 0 ? (
          <div className="p-8">
            <p className="text-sm text-[#68746e]">Henüz işlem bulunmuyor.</p>
            <Link
              href="/panel/odeme"
              className="mt-4 inline-flex rounded-2xl bg-[#10231d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#173f32]"
            >
              İlk Ödemeyi Al
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[#f8f6f1]">
                <tr>
                  {[
                    "Müşteri",
                    "Firma",
                    "Açıklama",
                    "Tutar",
                    "Durum",
                    "Tarih",
                    "",
                  ].map((head) => (
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
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-t border-[#17201c]/8 transition hover:bg-[#f8f6f1]/70"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {payment.companyName || "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-6 py-4 text-sm text-[#68746e]">
                      {payment.description || "—"}
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#68746e]">
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
