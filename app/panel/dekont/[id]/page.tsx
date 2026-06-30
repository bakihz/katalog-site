import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import {
  formatAmountWithCurrencySuffix,
  formatDateTime,
} from "@/lib/format";
import { getPaymentStatusLabel } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
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

  const payment = await prisma.payment.findFirst({
    where: { id: Number(id), agentId },
    include: { agent: { select: { name: true } } },
  });

  if (!payment) return notFound();

  return (
    <>
      <div className="p-10 print:hidden">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/panel/islemler"
            className="text-sm text-blue-600 hover:underline"
          >
            ← İşlemlere Dön
          </Link>
          <ReceiptPrintButton />
        </div>
      </div>

      <div
        id="dekont"
        className="mx-auto max-w-lg rounded-2xl bg-white p-10 text-black shadow-lg print:mx-0 print:max-w-full print:rounded-none print:p-8 print:shadow-none"
      >
        <div className="mb-6 border-b pb-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            Ödeme Dekontu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatDateTime(payment.createdAt, {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Dekont No" value={`#${payment.id}`} />
          <Row label="Sipariş No" value={payment.orderId ?? "—"} />
          <Row label="Müşteri Adı" value={payment.customerName} />
          {payment.companyName && (
            <Row label="Firma / Cari" value={payment.companyName} />
          )}
          {payment.description && (
            <Row label="Açıklama" value={payment.description} />
          )}
          <Row
            label="Ödeme Tutarı"
            value={formatAmountWithCurrencySuffix(payment.amount)}
            bold
          />
          <Row
            label="Durum"
            value={getPaymentStatusLabel(payment.status).toLocaleUpperCase(
              "tr-TR",
            )}
            color={
              payment.status === "Paid" ? "text-green-600" : "text-red-600"
            }
          />
          {payment.transactionId && (
            <Row label="İşlem ID" value={payment.transactionId} />
          )}
          {payment.providerName && (
            <Row label="POS" value={payment.providerName} />
          )}
          {payment.agent && <Row label="Temsilci" value={payment.agent.name} />}
        </dl>

        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
          <p>Bu dekont bilgilendirme amaçlıdır.</p>
          <p>
            Oluşturma tarihi:{" "}
            {formatDateTime(new Date(), {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #dekont, #dekont * { visibility: visible; }
          #dekont { position: fixed; top: 0; left: 0; width: 100%; }
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
        className={`text-right font-medium ${bold ? "text-base font-bold" : ""} ${color ?? ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
