"use client";

import jsPDF from "jspdf";

type PrintReceiptButtonProps = {
  receipt: {
    id: number;
    customerName: string;
    amount: string;
    date: string;
    companyName?: string;
    providerName?: string;
    transactionId?: string;
    description?: string;
  };
};

function buildReceiptPdf(receipt: PrintReceiptButtonProps["receipt"]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [180, 80],
  });

  let y = 10;
  const left = 6;
  const addLine = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label, left, y);
    doc.setFont("courier", "bold");
    doc.text(value, 74, y, { align: "right" });
    y += 5;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KATALOG POS", 40, y, { align: "center" });
  y += 4;
  doc.setFontSize(9);
  doc.text("SATIS DEKONTU", 40, y, { align: "center" });
  y += 4;

  doc.setDrawColor(130);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(left, y, 74, y);
  y += 5;

  addLine("DEKONT NO", `#${receipt.id}`);
  addLine("TARIH", receipt.date);
  addLine("MUSTERI", receipt.customerName);
  if (receipt.companyName) addLine("FIRMA", receipt.companyName);
  if (receipt.providerName) addLine("POS", receipt.providerName);
  addLine("DURUM", "BASARILI");
  addLine("TOPLAM", receipt.amount);
  if (receipt.transactionId) addLine("ISLEM NO", receipt.transactionId);

  if (receipt.description) {
    y += 1;
    doc.line(left, y, 74, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("ACIKLAMA", left, y);
    y += 4;
    doc.setFont("courier", "normal");
    const wrapped = doc.splitTextToSize(receipt.description, 68);
    doc.text(wrapped, left, y);
  }

  return doc.output("blob");
}

export function PrintReceiptButton({ receipt }: PrintReceiptButtonProps) {
  const onShare = async () => {
    const pdfBlob = buildReceiptPdf(receipt);
    const file = new File([pdfBlob], `dekont-${receipt.id}.pdf`, {
      type: "application/pdf",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
      });
      return;
    }

    const downloadUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `dekont-${receipt.id}.pdf`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
      >
        Dekont Al (Yazdır / PDF)
      </button>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        WhatsApp&apos;ta PDF Paylaş
      </button>
    </div>
  );
}
