import {
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  isSuccessfulPaymentStatus,
} from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";

const pendingExpirationHours = 1;

async function getPayments() {
  return prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      agent: {
        select: {
          name: true,
        },
      },
    },
  });
}

function formatMoney(amount: number) {
  return amount.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
}

export default async function PaymentsPage() {
  const payments = await getPayments();
  const expiredBefore = new Date();
  expiredBefore.setHours(expiredBefore.getHours() - pendingExpirationHours);
  const expirablePendingCount = payments.filter(
    (payment) =>
      payment.status === "Pending" && payment.createdAt < expiredBefore,
  ).length;
  const totalAmount = payments
    .filter((payment) => isSuccessfulPaymentStatus(payment.status))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2853e]">
              Finans
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Ödeme Kayıtları
            </h2>
            <p className="mt-2 text-sm text-[#68746e]">
              Tüm ödeme denemeleri ve tahsilat kayıtları burada listelenir.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-2xl bg-[#f5f3ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a867f]">
                Kayıt
              </p>
              <p className="mt-1 text-2xl font-bold">
                {payments.length.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="rounded-2xl bg-[#10231d] p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                Ciro
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatMoney(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">Bekleyen ödeme kontrolü</p>
            <p className="mt-1 text-amber-800">
              {pendingExpirationHours} saati aşan bekleyen işlemler “Süresi
              Doldu” olarak işaretlenebilir. Şu an{" "}
              <strong>{expirablePendingCount}</strong> işlem uygun görünüyor.
            </p>
          </div>
          <form action="/api/admin/payments/expire-pending" method="post">
            <button
              type="submit"
              disabled={expirablePendingCount === 0}
              className="rounded-full bg-[#10231d] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#173f32] disabled:cursor-not-allowed disabled:bg-[#10231d]/35"
            >
              Eski Bekleyenleri Kapat
            </button>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#17201c]/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-[#f8f6f1]">
              <tr className="text-xs uppercase tracking-[0.14em] text-[#89938e]">
                <th className="px-6 py-4">Müşteri</th>
                <th className="px-6 py-4">Firma</th>
                <th className="px-6 py-4">Temsilci</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4">Tutar</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17201c]/8">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-sm text-[#68746e]">
                    Henüz ödeme kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="align-top">
                    <td className="px-6 py-4 font-semibold">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {payment.companyName || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {payment.agent?.name ?? "Genel"}
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-[#68746e]">
                      {payment.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPaymentStatusBadgeClass(
                          payment.status,
                        )}`}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {new Date(payment.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
