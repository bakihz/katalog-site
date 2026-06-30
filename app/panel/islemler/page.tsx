import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { isSuccessfulPaymentStatus } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { AppButton, PageHeader, PaymentStatusBadge } from "@/components/ui";
import Link from "next/link";

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
      <PageHeader
        eyebrow="İşlemlerim"
        title="Tahsilat kayıtları"
        description="Bu listede yalnızca sizin hesabınızla oluşturulan işlemler gösterilir."
        aside={
          <div className="rounded-2xl bg-[#edf1ec] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a867f]">
              Toplam Tahsilat
            </p>
            <p className="mt-1 text-xl font-bold text-[#10231d]">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        }
      />

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white shadow-xl shadow-[#10231d]/10">
        {payments.length === 0 ? (
          <div className="p-8">
            <p className="text-sm text-[#68746e]">Henüz işlem bulunmuyor.</p>
            <AppButton href="/panel/odeme" size="lg" className="mt-4">
              İlk Ödemeyi Al
            </AppButton>
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
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#68746e]">
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
