import { prisma } from "@/lib/prisma";
import { formatAmountWithCurrencySuffix, formatDateTime } from "@/lib/format";
import Link from "next/link";
import { PrintReceiptButton } from "./PrintReceiptButton";

export default async function BasariliPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const id = Number(params.id);

  const payment = id
    ? await prisma.payment.findUnique({ where: { id } })
    : null;
  const formattedDate = payment ? formatDateTime(payment.createdAt) : "";
  const formattedAmount = payment
    ? formatAmountWithCurrencySuffix(payment.amount)
    : "";

  return (
    <main className="mx-auto w-full max-w-sm px-3 py-6 text-center sm:max-w-xl sm:px-6 sm:py-10">
      <div className="print:hidden">
        <div className="mb-3 text-6xl text-green-500">✓</div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Ödeme Başarılı</h1>
        <p className="text-sm text-gray-400 sm:text-base">
          Ödemeniz başarıyla alındı.
        </p>
      </div>

      {payment && (
        <>
          <div className="mt-5 print:hidden">
            <PrintReceiptButton
              receipt={{
                id: payment.id,
                customerName: payment.customerName,
                amount: formattedAmount,
                date: formattedDate,
                companyName: payment.companyName ?? undefined,
                providerName: payment.providerName ?? undefined,
                transactionId: payment.transactionId ?? undefined,
                description: payment.description ?? undefined,
              }}
            />
          </div>

          <div
            id="dekont"
            className="mx-auto mt-6 w-full max-w-[360px] rounded-xl border border-gray-300 bg-white p-4 text-left font-mono text-[13px] leading-5 text-black shadow-md print:mt-0 print:max-w-[78mm] print:rounded-none print:border-0 print:p-0 print:shadow-none"
          >
            <div className="text-center">
              <p className="text-[15px] font-bold tracking-wide">LALE EDT GIDA</p>
              <p className="text-[11px] tracking-wide">SATIS DEKONTU</p>
            </div>

            <div className="my-3 border-t border-dashed border-gray-400" />

            <div className="space-y-1">
              <Line label="DEKONT NO" value={`#${payment.id}`} />
              <Line label="TARIH" value={formattedDate} />
              <Line label="MUSTERI" value={payment.customerName} />
              {payment.companyName && (
                <Line label="FIRMA" value={payment.companyName} />
              )}
              {payment.providerName && (
                <Line label="POS" value={payment.providerName} />
              )}
            </div>

            {payment.description && (
              <>
                <div className="my-3 border-t border-dashed border-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-600">ACIKLAMA</p>
                  <p className="break-words">{payment.description}</p>
                </div>
              </>
            )}

            <div className="my-3 border-t border-dashed border-gray-400" />

            <div className="space-y-1">
              <Line label="DURUM" value="BASARILI" valueClassName="font-bold" />
              <Line
                label="TOPLAM"
                value={formattedAmount}
                valueClassName="text-[16px] font-bold"
              />
              {payment.transactionId && (
                <Line label="ISLEM NO" value={payment.transactionId} />
              )}
            </div>

            <div className="my-3 border-t border-dashed border-gray-400" />

            <div className="text-center text-[11px] text-gray-700">
              <p>BU BELGE TAHSILAT KAYDI OLARAK OLUSTURULMUSTUR</p>
              <p>PAYLASIM ICIN UYGUNDUR</p>
            </div>
          </div>
        </>
      )}

      <Link
        href="/odeme"
        className="print:hidden mt-8 inline-block text-gray-400 hover:text-white text-sm"
      >
        Ana sayfaya dön
      </Link>

      <style>{`
        @media print {
          @page { size: auto; margin: 8mm; }
          body * { visibility: hidden; }
          #dekont, #dekont * { visibility: visible; }
          #dekont { position: fixed; top: 0; left: 0; right: 0; margin: 0 auto; }
        }
      `}</style>
    </main>
  );
}

function Line({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-gray-600">{label}</span>
      <span className={`text-right break-words ${valueClassName ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
