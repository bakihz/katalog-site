import Link from "next/link";
import {
  adminPaymentPageSizeOptions,
  buildAdminPaymentsQueryString,
  parseAdminPaymentFilters,
} from "@/lib/adminPaymentFilters";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { getPaymentCardMasked } from "@/lib/paymentCard";
import { prisma } from "@/lib/prisma";
import {
  AppButton,
  PageHeader,
  PaymentStatusBadge,
  StatCard,
} from "@/components/ui";

const pendingExpirationHours = 1;

type AdminPaymentsPageProps = {
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

export default async function PaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const params = await searchParams;
  const filters = parseAdminPaymentFilters(params);
  const exportQuery = buildAdminPaymentsQueryString(filters, { page: "" });
  const [payments, agents, totalCount, totalAmountResult] = await Promise.all([
    prisma.payment.findMany({
      where: filters.where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: {
        agent: {
          select: { name: true },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true },
    }),
    prisma.payment.count({ where: filters.where }),
    prisma.payment.aggregate({
      where: {
        ...filters.where,
        status: { in: ["success", "Paid"] },
      },
      _sum: { amount: true },
    }),
  ]);
  const expiredBefore = new Date();
  expiredBefore.setHours(expiredBefore.getHours() - pendingExpirationHours);
  const expirablePendingCount = payments.filter(
    (payment) =>
      payment.status === "Pending" && payment.createdAt < expiredBefore,
  ).length;
  const totalAmount = totalAmountResult._sum.amount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const previousPageHref =
    safePage > 1
      ? `/admin/payments?${buildAdminPaymentsQueryString(filters, {
          page: String(safePage - 1),
        })}`
      : undefined;
  const nextPageHref =
    safePage < totalPages
      ? `/admin/payments?${buildAdminPaymentsQueryString(filters, {
          page: String(safePage + 1),
        })}`
      : undefined;

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
              value={formatNumber(totalCount)}
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
              Doldu” olarak işaretlenebilir. Bu sayfada{" "}
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

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-5 shadow-sm">
        <form className="grid gap-3 xl:grid-cols-[1fr_180px_220px_170px_170px_150px_auto_auto]">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Ara
            </span>
            <input
              type="search"
              name="q"
              defaultValue={filters.query}
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
              defaultValue={filters.status}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Temsilci
            </span>
            <select
              name="agentId"
              defaultValue={filters.selectedAgentId || ""}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            >
              <option value="">Tüm Temsilciler</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} (@{agent.username})
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Başlangıç
            </span>
            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Bitiş
            </span>
            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
              Sayfa
            </span>
            <select
              name="pageSize"
              defaultValue={filters.pageSize}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            >
              {adminPaymentPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} kayıt
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
              href="/admin/payments"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Temizle
            </AppButton>
          </div>
        </form>

        <div className="mt-4 flex flex-col gap-2 border-t border-[#17201c]/8 pt-4 text-sm text-[#68746e] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {formatNumber(totalCount)} kayıt içinden bu sayfada{" "}
            {formatNumber(payments.length)} kayıt gösteriliyor.
          </p>
          <AppButton
            href={`/api/admin/payments/export${exportQuery ? `?${exportQuery}` : ""}`}
            variant="secondary"
            size="sm"
          >
            CSV İndir
          </AppButton>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#17201c]/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="bg-[#f8f6f1]">
              <tr className="text-xs uppercase tracking-[0.14em] text-[#89938e]">
                <th className="px-6 py-4">Firma / Cari</th>
                <th className="px-6 py-4">Kart Sahibi</th>
                <th className="px-6 py-4">Kart</th>
                <th className="px-6 py-4">Temsilci</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4">Tutar</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17201c]/8">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-sm text-[#68746e]">
                    Henüz ödeme kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="align-top">
                    <td className="px-6 py-4 font-semibold">
                      {payment.companyName || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#68746e]">
                      {getPaymentCardMasked(payment) ?? "—"}
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
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/payments/${payment.id}`}
                        className="rounded-full bg-[#10231d] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#173f32]"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalCount > 0 && (
        <nav className="flex flex-col gap-3 rounded-[1.75rem] border border-[#17201c]/10 bg-white p-4 text-sm text-[#68746e] shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sayfa <strong className="text-[#10231d]">{safePage}</strong> /{" "}
            <strong className="text-[#10231d]">{totalPages}</strong>
          </p>
          <div className="flex gap-2">
            <AppButton
              href={previousPageHref}
              variant="outline"
              size="sm"
              disabled={!previousPageHref}
            >
              Önceki
            </AppButton>
            <AppButton
              href={nextPageHref}
              variant="outline"
              size="sm"
              disabled={!nextPageHref}
            >
              Sonraki
            </AppButton>
          </div>
        </nav>
      )}
    </div>
  );
}
