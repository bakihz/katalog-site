import Link from "next/link";
import { notFound } from "next/navigation";
import { formatAmountWithCurrencySuffix, formatDateTime } from "@/lib/format";
import { getPaymentCardMasked } from "@/lib/paymentCard";
import { getPaymentStatusLabel } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { AppButton, PageHeader, PaymentStatusBadge } from "@/components/ui";
import { ReceiptPrintButton } from "@/app/panel/dekont/[id]/ReceiptPrintButton";
import { normalizePaymentFailureMessage } from "@/lib/paymentFailure";

type AdminPaymentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPaymentDetailPage({
  params,
}: AdminPaymentDetailPageProps) {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
    include: { agent: { select: { name: true, username: true } } },
  });

  if (!payment) return notFound();

  const paymentWithFailure = payment as typeof payment & {
    errorCode?: string | null;
    errorMessage?: string | null;
  };
  const formattedDate = formatDateTime(payment.createdAt, {
    dateStyle: "long",
    timeStyle: "short",
  });
  const formattedAmount = formatAmountWithCurrencySuffix(payment.amount);
  const statusLabel = getPaymentStatusLabel(payment.status).toLocaleUpperCase(
    "tr-TR",
  );
  const card = getPaymentCardMasked(payment) ?? "—";
  const canCreateReceipt =
    payment.status === "Paid" || payment.status === "success";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Ödeme Detayı"
        title={`İşlem #${payment.id}`}
        description="Tahsilat kaydına ait işlem bilgilerini buradan inceleyebilirsiniz."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton href="/admin/payments" variant="outline" size="lg">
              Ödeme Kayıtlarına Dön
            </AppButton>
            {canCreateReceipt && (
              <ReceiptPrintButton
                receipt={{
                  id: payment.id,
                  orderId: payment.orderId ?? "—",
                  companyName: payment.companyName ?? "—",
                  customerName: payment.customerName,
                  card,
                  description: payment.description ?? undefined,
                  amount: formattedAmount,
                  status: statusLabel,
                  transactionId: payment.transactionId ?? undefined,
                  providerName: payment.providerName ?? undefined,
                  agentName: payment.agent?.name,
                  date: formattedDate,
                  fileDate: formatDateTime(payment.createdAt, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).replaceAll(".", "-"),
                }}
              />
            )}
          </div>
        }
      />

      {payment.status === "Failed" && (
        <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em]">
            Başarısız İşlem
          </p>
          <h2 className="mt-2 text-2xl font-black text-red-950">
            Banka işlemi onaylamadı
          </h2>
          <p className="mt-2 text-sm leading-6">
            {normalizePaymentFailureMessage(paymentWithFailure.errorMessage) ||
              "Banka tarafından açıklama iletilmedi."}
            {paymentWithFailure.errorCode
              ? ` (${paymentWithFailure.errorCode})`
              : ""}
          </p>
        </section>
      )}

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#17201c]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a867f]">
              İşlem Özeti
            </p>
            <h2 className="mt-1 text-xl font-black text-[#10231d]">
              {payment.companyName || payment.customerName}
            </h2>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <SummaryRow label="Sipariş No" value={payment.orderId ?? "—"} />
          <SummaryRow label="Durum" value={getPaymentStatusLabel(payment.status)} />
          <SummaryRow label="Firma / Cari" value={payment.companyName ?? "—"} />
          <SummaryRow label="Kart Sahibi" value={payment.customerName} />
          <SummaryRow label="Kart" value={card} />
          <SummaryRow label="Tutar" value={formattedAmount} />
          <SummaryRow label="POS" value={payment.providerName ?? "—"} />
          <SummaryRow label="Tarih" value={formattedDate} />
          <SummaryRow
            label="Temsilci"
            value={
              payment.agent
                ? `${payment.agent.name} (@${payment.agent.username})`
                : "Genel"
            }
          />
          {payment.transactionId && (
            <SummaryRow label="İşlem ID" value={payment.transactionId} />
          )}
          {paymentWithFailure.errorCode && (
            <SummaryRow label="Hata Kodu" value={paymentWithFailure.errorCode} />
          )}
          {paymentWithFailure.errorMessage && (
            <SummaryRow
              label="Hata Mesajı"
              value={normalizePaymentFailureMessage(
                paymentWithFailure.errorMessage,
              )}
            />
          )}
        </dl>

        {payment.description && (
          <div className="mt-5 rounded-2xl bg-[#f8f6f1] p-4 text-sm">
            <p className="font-bold text-[#10231d]">Açıklama</p>
            <p className="mt-1 text-[#68746e]">{payment.description}</p>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/admin/payments"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-[#173f32] transition hover:bg-[#edf1ec]"
          >
            ← Listeye Dön
          </Link>
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[#68746e]">{label}</dt>
      <dd className="mt-1 font-bold text-[#10231d]">{value}</dd>
    </div>
  );
}
