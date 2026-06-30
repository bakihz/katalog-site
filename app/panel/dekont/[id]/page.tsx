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
      {/* Ekran görünümü */}
      <div className="p-10 print:hidden">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/panel/islemler"
            className="text-sm text-blue-600 hover:underline"
          >
            ← İşlemlere Dön
          </Link>
          <button
            onClick={() => window.print()}
            className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition-colors"
          >
            Yazdır / PDF
          </button>
        </div>
      </div>

      {/* Dekont - hem ekran hem baskı */}
      <div
        id="dekont"
        className="mx-auto max-w-lg bg-white text-black p-10 print:p-8 print:max-w-full print:mx-0 print:shadow-none shadow-lg rounded-2xl print:rounded-none"
      >
        {/* Başlık */}
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-2xl font-bold tracking-wide uppercase">
            Ödeme Dekontu
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDateTime(payment.createdAt, {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>

        {/* Detaylar */}
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

        {/* Alt bilgi */}
        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
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

      {/* Print butonu için client script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('button')?.addEventListener('click', () => window.print());
          `,
        }}
      />

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
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd
        className={`text-right font-medium ${bold ? "font-bold text-base" : ""} ${color ?? ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
