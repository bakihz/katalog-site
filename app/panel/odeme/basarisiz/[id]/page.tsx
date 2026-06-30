import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { formatAmountWithCurrencySuffix, formatDateTime } from "@/lib/format";
import { getPaymentStatusLabel } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { AppButton, PaymentStatusBadge } from "@/components/ui";

type FailedPaymentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FailedPaymentPage({
  params,
  searchParams,
}: FailedPaymentPageProps) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const payment = await prisma.payment.findFirst({
    where: { id: Number(id), agentId },
    include: { agent: { select: { name: true } } },
  });

  if (!payment) return notFound();

  const paymentWithFailure = payment as typeof payment & {
    errorCode?: string | null;
    errorMessage?: string | null;
  };
  const errorMessage =
    getFirstParam(queryParams.err) ??
    paymentWithFailure.errorMessage ??
    undefined;
  const errorCode =
    getFirstParam(queryParams.code) ?? paymentWithFailure.errorCode ?? undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center shadow-xl shadow-red-950/5">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          !
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-red-700">
          Ödeme Başarısız
        </p>
        <h1 className="mt-2 text-2xl font-black text-[#10231d] sm:text-3xl">
          Banka işlemi onaylamadı
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#68746e]">
          Tahsilat kaydı başarısız olarak işlendi. Müşterinizden kart
          bilgilerini kontrol etmesini isteyebilir veya yeni bir ödeme
          deneyebilirsiniz.
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
            {errorCode ? ` (${errorCode})` : ""}
          </div>
        )}
      </div>

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#17201c]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a867f]">
              İşlem Özeti
            </p>
            <h2 className="mt-1 text-xl font-black text-[#10231d]">
              #{payment.id}
            </h2>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <SummaryRow label="Sipariş No" value={payment.orderId ?? "—"} />
          <SummaryRow
            label="Durum"
            value={getPaymentStatusLabel(payment.status)}
          />
          <SummaryRow label="Müşteri" value={payment.customerName} />
          <SummaryRow label="Firma / Cari" value={payment.companyName ?? "—"} />
          <SummaryRow
            label="Tutar"
            value={formatAmountWithCurrencySuffix(payment.amount)}
          />
          <SummaryRow label="POS" value={payment.providerName ?? "—"} />
          <SummaryRow
            label="Tarih"
            value={formatDateTime(payment.createdAt, {
              dateStyle: "long",
              timeStyle: "short",
            })}
          />
          <SummaryRow label="Temsilci" value={payment.agent?.name ?? "—"} />
        </dl>

        {payment.description && (
          <div className="mt-5 rounded-2xl bg-[#f8f6f1] p-4 text-sm">
            <p className="font-bold text-[#10231d]">Açıklama</p>
            <p className="mt-1 text-[#68746e]">{payment.description}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <AppButton href="/panel/odeme" size="lg">
            Yeni Ödeme Dene
          </AppButton>
          <AppButton href="/panel/islemler" variant="outline" size="lg">
            İşlemlere Git
          </AppButton>
          <Link
            href="/panel"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-[#173f32] transition hover:bg-[#edf1ec]"
          >
            Panele Dön
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
