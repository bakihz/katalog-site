export const SUCCESSFUL_PAYMENT_STATUSES = ["success", "Paid"] as const;

const paymentStatusLabels: Record<string, string> = {
  success: "Başarılı",
  Paid: "Başarılı",
  Failed: "Başarısız",
  Pending: "Bekliyor",
  Expired: "Süresi Doldu",
  Cancelled: "İptal Edildi",
};

const paymentStatusBadgeClasses: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 ring-emerald-600/15",
  Paid: "bg-emerald-100 text-emerald-700 ring-emerald-600/15",
  Failed: "bg-red-100 text-red-700 ring-red-600/15",
  Pending: "bg-amber-100 text-amber-700 ring-amber-600/15",
  Expired: "bg-slate-100 text-slate-700 ring-slate-600/15",
  Cancelled: "bg-zinc-100 text-zinc-700 ring-zinc-600/15",
};

export function isSuccessfulPaymentStatus(status: string) {
  return SUCCESSFUL_PAYMENT_STATUSES.includes(
    status as (typeof SUCCESSFUL_PAYMENT_STATUSES)[number],
  );
}

export function getPaymentStatusLabel(status: string) {
  return paymentStatusLabels[status] ?? status;
}

export function getPaymentStatusBadgeClass(status: string) {
  return (
    paymentStatusBadgeClasses[status] ??
    "bg-gray-100 text-gray-700 ring-gray-600/15"
  );
}
