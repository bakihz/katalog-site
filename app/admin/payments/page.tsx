import {
  isSuccessfulPaymentStatus,
} from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import {
  AppButton,
  PageHeader,
  PaymentStatusBadge,
  StatCard,
} from "@/components/ui";

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
      <PageHeader
        eyebrow="Finans"
        title="Ödeme Kayıtları"
        description="Tüm ödeme denemeleri ve tahsilat kayıtları burada listelenir."
        aside={
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <StatCard
              label="Kayıt"
              value={formatNumber(payments.length)}
              className="bg-[#f5f3ee] p-4 shadow-none"
            />
            <StatCard
              label="Ciro"
              value={formatCurrency(totalAmount)}
              className="bg-[#10231d] p-4 text-white shadow-none [&_p:first-of-type]:text-white/55"
            />
          </div>
        }
      />

      <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">Bekleyen ödeme kontrolü</p>
            <p className="mt-1 text-amber-800">
              {pendingExpirationHours} saati aşan bekleyen işlemler “Süresi
              Doldu” olarak işaretlenebilir. Şu an{" "}
              <strong>{expirablePendingCount}</strong> işlem uygun görünüyor.
            </p>
          </div>
          <form action="/api/admin/payments/expire-pending" method="post">
            <AppButton
              type="submit"
              disabled={expirablePendingCount === 0}
              size="sm"
            >
              Eski Bekleyenleri Kapat
            </AppButton>
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
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {formatDateTime(payment.createdAt)}
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
