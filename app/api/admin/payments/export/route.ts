import { parseAdminPaymentFilters } from "@/lib/adminPaymentFilters";
import { formatDateTime } from "@/lib/format";
import { getPaymentCardMasked } from "@/lib/paymentCard";
import { getPaymentStatusLabel } from "@/lib/paymentStatus";
import { prisma } from "@/lib/prisma";

const csvHeaders = [
  "ID",
  "Firma / Cari",
  "Kart Sahibi",
  "Kart",
  "Temsilci",
  "Açıklama",
  "Tutar",
  "Durum",
  "Sipariş No",
  "İşlem No",
  "Hata Kodu",
  "Hata Mesajı",
  "Tarih",
];

export async function GET(req: Request) {
  const filters = parseAdminPaymentFilters(new URL(req.url).searchParams);
  const payments = await prisma.payment.findMany({
    where: filters.where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      agent: {
        select: { name: true },
      },
    },
  });
  const rows = payments.map((payment) => [
    payment.id,
    payment.companyName ?? "",
    payment.customerName,
    getPaymentCardMasked(payment) ?? "",
    payment.agent?.name ?? "Genel",
    payment.description ?? "",
    payment.amount.toFixed(2),
    getPaymentStatusLabel(payment.status),
    payment.orderId ?? "",
    payment.transactionId ?? "",
    payment.errorCode ?? "",
    payment.errorMessage ?? "",
    formatDateTime(payment.createdAt),
  ]);
  const csv = [csvHeaders, ...rows]
    .map((row) => row.map(formatCsvCell).join(";"))
    .join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="odeme-kayitlari-${getToday()}.csv"`,
    },
  });
}

function formatCsvCell(value: unknown) {
  const text = String(value ?? "");
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
