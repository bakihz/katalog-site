import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPaymentCardMasked } from "@/lib/paymentCard";
import { isSuccessfulPaymentStatus } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { canViewAllPayments } from "@/lib/userRole";
import { AppButton, PageHeader, PaymentStatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

type IslemlerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusOptions = [
  { value: "", label: "Tüm Durumlar" },
  { value: "Paid", label: "Başarılı" },
  { value: "Failed", label: "Başarısız" },
  { value: "Pending", label: "Bekliyor" },
  { value: "Expired", label: "Süresi Doldu" },
  { value: "Cancelled", label: "İptal Edildi" },
];

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IslemlerPage({
  searchParams,
}: IslemlerPageProps) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const currentUser = await prisma.user.findUnique({ where: { id: agentId } });
  const canViewAll = canViewAllPayments(currentUser);
  const query = (getFirstParam(params.q) ?? "").trim();
  const status = (getFirstParam(params.status) ?? "").trim();

  const where: Prisma.PaymentWhereInput = {
    ...(canViewAll ? {} : { agentId }),
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { customerName: { contains: query } },
            { companyName: { contains: query } },
            { description: { contains: query } },
            { orderId: { contains: query } },
            { providerName: { contains: query } },
          ],
        }
      : {}),
  };

  const [payments, totalPaid] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({
      where: {
        ...(canViewAll ? {} : { agentId }),
        status: { in: ["success", "Paid"] },
      },
      _sum: { amount: true },
    }),
  ]);
  const paymentsWithFailure = payments as Array<
    (typeof payments)[number] & { errorMessage?: string | null }
  >;

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
              {formatCurrency(totalPaid._sum.amount ?? 0)}
            </p>
          </div>
        }
      />

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-5 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Ara
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Firma/cari, kart sahibi, açıklama veya sipariş no"
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Durum
            </span>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <AppButton type="submit" size="lg" className="w-full">
              Filtrele
            </AppButton>
          </div>

          <div className="flex items-end">
            <AppButton
              href="/panel/islemler"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Temizle
            </AppButton>
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white shadow-xl shadow-[#10231d]/10">
        {payments.length === 0 ? (
          <div className="p-8">
            <p className="text-sm text-[#68746e]">
              Bu kriterlere uygun işlem bulunmuyor.
            </p>
            <AppButton href="/panel/odeme" size="lg" className="mt-4">
              Yeni Ödeme Al
            </AppButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead className="bg-[#f8f6f1]">
                <tr>
                  {[
                    "Firma / Cari",
                    "Kart Sahibi",
                    "Kart",
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
                {paymentsWithFailure.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-t border-[#17201c]/8 transition hover:bg-[#f8f6f1]/70"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">
                      {payment.companyName || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#68746e]">
                      {getPaymentCardMasked(payment) ?? "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-6 py-4 text-sm text-[#68746e]">
                      {payment.description || payment.errorMessage || "—"}
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
                      {isSuccessfulPaymentStatus(payment.status) ? (
                        <Link
                          href={`/panel/dekont/${payment.id}`}
                          className="rounded-full bg-[#10231d] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#173f32]"
                        >
                          Dekont
                        </Link>
                      ) : payment.status === "Failed" ? (
                        <Link
                          href={`/panel/odeme/basarisiz/${payment.id}`}
                          className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200"
                        >
                          Detay
                        </Link>
                      ) : null}
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
