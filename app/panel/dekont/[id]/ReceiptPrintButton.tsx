"use client";

export function ReceiptPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="ml-auto rounded-xl bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-500"
    >
      Yazdır / PDF
    </button>
  );
}
