"use client";

import jsPDF from "jspdf";

export type ReceiptData = {
  id: number;
  orderId: string;
  companyName: string;
  customerName: string;
  card: string;
  description?: string;
  amount: string;
  status: string;
  transactionId?: string;
  providerName?: string;
  agentName?: string;
  date: string;
  fileDate: string;
};

type ReceiptPrintButtonProps = {
  receipt: ReceiptData;
};

function buildReceiptPdf(receipt: ReceiptData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 18;
  const right = pageWidth - 18;
  let y = 18;

  const addDivider = () => {
    doc.setDrawColor(210);
    doc.line(left, y, right, y);
    y += 7;
  };

  const addLine = (label: string, value: string, bold = false) => {
    const safeLabel = toPdfSafeText(label);
    const safeValue = toPdfSafeText(value);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(safeLabel, left, y);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(20);
    const wrapped = doc.splitTextToSize(safeValue, 95);
    doc.text(wrapped, right, y, { align: "right" });
    y += Math.max(7, wrapped.length * 5);
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(16, 35, 29);
  doc.text("LALE EDT", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(13);
  doc.text("ODEME DEKONTU", pageWidth / 2, y, { align: "center" });
  y += 10;
  addDivider();

  addLine("Dekont No", `#${receipt.id}`);
  addLine("Siparis No", receipt.orderId);
  addLine("Tarih", receipt.date);
  addLine("Firma / Cari", receipt.companyName);
  addLine("Kart Sahibi", receipt.customerName);
  addLine("Kart", receipt.card);
  if (receipt.description) addLine("Aciklama", receipt.description);
  addLine("Odeme Tutari", receipt.amount, true);
  addLine("Durum", receipt.status, true);
  if (receipt.transactionId) addLine("Islem ID", receipt.transactionId);
  if (receipt.providerName) addLine("POS", receipt.providerName);
  if (receipt.agentName) addLine("Temsilci", receipt.agentName);

  y += 3;
  addDivider();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Bu belge tahsilat kaydi olarak olusturulmustur.", pageWidth / 2, y, {
    align: "center",
  });

  return doc.output("blob");
}

function toPdfSafeText(value: string) {
  return value
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "G")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "S")
    .replaceAll("ı", "i")
    .replaceAll("İ", "I")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "C")
    .replace(/[^\x20-\x7E]/g, "");
}

function downloadBlob(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

function printPdfBlob(blob: Blob) {
  const printUrl = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = printUrl;

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    window.setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(printUrl);
    }, 1000);
  };

  document.body.appendChild(iframe);
}

export function ReceiptPrintButton({ receipt }: ReceiptPrintButtonProps) {
  const filename = `Lale_EDT_Gida_Dekont_${receipt.fileDate}_ID-${receipt.id}.pdf`;

  const onPrint = () => {
    printPdfBlob(buildReceiptPdf(receipt));
  };

  const onDownload = () => {
    downloadBlob(buildReceiptPdf(receipt), filename);
  };

  const onShare = async () => {
    const pdfBlob = buildReceiptPdf(receipt);
    const file = new File([pdfBlob], filename, {
      type: "application/pdf",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Dekont #${receipt.id}`,
      });
      return;
    }

    downloadBlob(pdfBlob, filename);
  };

  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onPrint}
        className="rounded-xl bg-[#10231d] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#173f32]"
      >
        PDF Yazdır
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="rounded-xl border border-[#17201c]/10 bg-white px-4 py-2 text-sm font-bold text-[#173f32] transition-colors hover:bg-[#edf1ec]"
      >
        PDF İndir
      </button>
      <button
        type="button"
        onClick={onShare}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500"
      >
        PDF Paylaş
      </button>
    </div>
  );
}
