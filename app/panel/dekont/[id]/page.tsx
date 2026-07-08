import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAgentCookie } from "@/lib/agentAuth";
import {
  formatAmountWithCurrencySuffix,
  formatDateTime,
} from "@/lib/format";
import { getPaymentCardMasked } from "@/lib/paymentCard";
import { getPaymentStatusLabel } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { canViewAllPayments } from "@/lib/userRole";
import { ReceiptPrintButton } from "./ReceiptPrintButton";

export default async function DekontPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const currentUser = await prisma.user.findUnique({ where: { id: agentId } });
  const canViewAll = canViewAllPayments(currentUser);
  const payment = await prisma.payment.findFirst({
    where: { id: Number(id), ...(canViewAll ? {} : { agentId }) },
    include: { agent: { select: { name: true } } },
  });

  if (!payment) return notFound();

  const formattedDate = formatDateTime(payment.createdAt, {
    dateStyle: "long",
    timeStyle: "short",
  });
  const formattedAmount = formatAmountWithCurrencySuffix(payment.amount);
  const statusLabel = getPaymentStatusLabel(payment.status).toLocaleUpperCase(
    "tr-TR",
  );
  const card = getPaymentCardMasked(payment) ?? "—";

  return (
    <>
      <div className="p-6 print:hidden md:p-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/panel/islemler"
            className="text-sm font-semibold text-[#173f32] hover:underline"
          >
            ← İşlemlere Dön
          </Link>
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
        </div>
      </div>

      <main
        id="dekont"
        className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 text-black shadow-xl shadow-[#10231d]/10 print:max-w-[170mm] print:rounded-none print:p-0 print:shadow-none md:p-10"
      >
        <div className="mb-6 border-b border-[#17201c]/10 pb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7a867f]">
            Lale EDT
          </p>
          <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide">
            Ödeme Dekontu
          </h1>
          <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Dekont No" value={`#${payment.id}`} />
          <Row label="Sipariş No" value={payment.orderId ?? "—"} />
          <Row label="Firma / Cari" value={payment.companyName ?? "—"} />
          <Row label="Kart Sahibi" value={payment.customerName} />
          <Row label="Kart" value={card} />
          {payment.description && (
            <Row label="Açıklama" value={payment.description} />
          )}
          <Row label="Ödeme Tutarı" value={formattedAmount} bold />
          <Row
            label="Durum"
            value={statusLabel}
            color={
              payment.status === "Paid" || payment.status === "success"
                ? "text-green-600"
                : "text-red-600"
            }
          />
          {payment.transactionId && (
            <Row label="İşlem ID" value={payment.transactionId} />
          )}
          {payment.providerName && <Row label="POS" value={payment.providerName} />}
          {payment.agent && <Row label="Temsilci" value={payment.agent.name} />}
        </dl>

        <div className="mt-8 border-t border-[#17201c]/10 pt-6 text-center text-xs text-gray-400">
          <p>Bu belge tahsilat kaydı olarak oluşturulmuştur.</p>
          <p>
            Oluşturma tarihi:{" "}
            {formatDateTime(new Date(), {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
      </main>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body {
            width: 210mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #fff !important;
          }
          body * { visibility: hidden !important; }
          #dekont, #dekont * { visibility: visible !important; }
          #dekont {
            position: absolute !important;
            top: 0 !important;
            left: 50% !important;
            width: 160mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            transform: translateX(-50%) !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </>
  );
}

function Row({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd
        className={`break-words text-right font-medium ${bold ? "text-base font-bold" : ""} ${color ?? ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
