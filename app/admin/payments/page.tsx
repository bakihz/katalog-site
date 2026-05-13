import { prisma } from "@/lib/prisma";

async function getPayments() {
  return prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Ödeme Kayıtları</h1>

      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">İsim</th>

              <th className="text-left p-4">Firma</th>

              <th className="text-left p-4">Açıklama</th>

              <th className="text-left p-4">Tutar</th>

              <th className="text-left p-4">Durum</th>

              <th className="text-left p-4">Tarih</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b">
                <td className="p-4">{payment.customerName}</td>

                <td className="p-4">{payment.companyName}</td>

                <td className="p-4">{payment.description}</td>

                <td className="p-4">{payment.amount} TL</td>

                <td className="p-4">{payment.status}</td>

                <td className="p-4">
                  {new Date(payment.createdAt).toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
