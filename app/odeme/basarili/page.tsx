import { prisma } from "@/lib/prisma";

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
      <div className="text-green-500 text-7xl mb-4">✓</div>
      <h1 className="text-3xl font-bold mb-2">Ödeme Başarılı</h1>
      <p className="text-gray-400">Ödemeniz başarıyla alındı.</p>

      {payment && (
        <div className="mt-8 border rounded-xl p-6 text-left space-y-4">
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

          <div className="flex justify-between border-t pt-4">
            <span className="text-gray-400">Tutar</span>
            <span className="font-bold text-xl">
              {payment.amount.toFixed(2)} TL
            </span>
          </div>

          {payment.transactionId && (
            <div className="flex justify-between">
              <span className="text-gray-400">İşlem No</span>
              <span className="font-mono text-sm">{payment.transactionId}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">Tarih</span>
            <span>{new Date(payment.createdAt).toLocaleString("tr-TR")}</span>
          </div>
        </div>
      )}

      <a
        href="/odeme"
        className="mt-8 inline-block text-gray-400 hover:text-white text-sm"
      >
        Ana sayfaya dön
      </a>
    </main>
  );
}
