import { prisma } from "@/lib/prisma";
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

  return (
    <main className="max-w-xl mx-auto p-10 text-center">
      <div className="print:hidden">
        <div className="text-green-500 text-7xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-2">Ödeme Başarılı</h1>
        <p className="text-gray-400">Ödemeniz başarıyla alındı.</p>
      </div>

      {payment && (
        <>
          <div className="print:hidden mt-6">
            <PrintReceiptButton />
          </div>

          <div
            id="dekont"
            className="mt-8 border rounded-xl p-6 text-left space-y-4 bg-white text-black print:mt-0 print:rounded-none print:border-0 print:p-0"
          >
            <div className="flex justify-between">
              <span className="text-gray-400">Dekont No</span>
              <span>#{payment.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Ad Soyad</span>
              <span>{payment.customerName}</span>
            </div>

            {payment.companyName && (
              <div className="flex justify-between">
                <span className="text-gray-400">Firma</span>
                <span>{payment.companyName}</span>
              </div>
            )}

            {payment.description && (
              <div className="flex justify-between">
                <span className="text-gray-400">Açıklama</span>
                <span>{payment.description}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-400">Durum</span>
              <span className="font-semibold text-green-600">BAŞARILI</span>
            </div>

            <div className="flex justify-between border-t pt-4">
              <span className="text-gray-400">Tutar</span>
              <span className="font-bold text-xl">
                {payment.amount.toFixed(2)} TL
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Tarih</span>
              <span>{new Date(payment.createdAt).toLocaleString("tr-TR")}</span>
            </div>

            {payment.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-400">İşlem No</span>
                <span className="font-mono text-sm">{payment.transactionId}</span>
              </div>
            )}
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
          body * { visibility: hidden; }
          #dekont, #dekont * { visibility: visible; }
          #dekont { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </main>
  );
}
