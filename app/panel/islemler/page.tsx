import { cookies } from "next/headers";
import Link from "next/link";
import {
  adminPaymentPageSizeOptions,
  buildAdminPaymentsQueryString,
  parseAdminPaymentFilters,
} from "@/lib/adminPaymentFilters";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
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
  const filters = parseAdminPaymentFilters(params);
  const where = {
    ...filters.where,
    ...(canViewAll ? {} : { agentId }),
  };
  const [payments, totalPaid, totalCount, agents] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: { agent: { select: { name: true, username: true } } },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        status: { in: ["success", "Paid"] },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where }),
    canViewAll
      ? prisma.user.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, username: true },
        })
      : Promise.resolve([]),
  ]);
  const paymentsWithFailure = payments as Array<
    (typeof payments)[number] & { errorMessage?: string | null }
  >;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const previousPageHref =
    safePage > 1
      ? `/panel/islemler?${buildAdminPaymentsQueryString(filters, {
          page: String(safePage - 1),
        })}`
      : undefined;
  const nextPageHref =
    safePage < totalPages
      ? `/panel/islemler?${buildAdminPaymentsQueryString(filters, {
          page: String(safePage + 1),
        })}`
      : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={canViewAll ? "Finans" : "İşlemlerim"}
        title="Tahsilat kayıtları"
        description={
          canViewAll
            ? "Bu listede tüm temsilcilerin oluşturduğu işlemler gösterilir."
            : "Bu listede yalnızca sizin hesabınızla oluşturulan işlemler gösterilir."
        }
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
        <form
          className={`grid gap-3 ${
            canViewAll
              ? "xl:grid-cols-[1fr_180px_220px_170px_170px_150px_auto_auto]"
              : "xl:grid-cols-[1fr_180px_170px_170px_150px_auto_auto]"
          }`}
        >
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

          {canViewAll && (
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
          )}

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
              href="/panel/islemler"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Temizle
            </AppButton>
          </div>
        </form>

        <p className="mt-4 border-t border-[#17201c]/8 pt-4 text-sm text-[#68746e]">
          {formatNumber(totalCount)} kayıt içinden bu sayfada{" "}
          {formatNumber(payments.length)} kayıt gösteriliyor.
        </p>
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
            <table
              className={`w-full ${canViewAll ? "min-w-[1200px]" : "min-w-[1080px]"}`}
            >
              <thead className="bg-[#f8f6f1]">
                <tr>
                  {[
                    "Firma / Cari",
                    "Kart Sahibi",
                    ...(canViewAll ? ["Temsilci"] : []),
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
                    {canViewAll && (
                      <td className="px-6 py-4 text-sm font-semibold text-[#173f32]">
                        {payment.agent?.name ?? "Genel"}
                      </td>
                    )}
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
