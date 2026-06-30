import {
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
} from "@/lib/paymentStatus";

type PaymentStatusBadgeProps = {
  status: string;
  className?: string;
};

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        getPaymentStatusBadgeClass(status),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {getPaymentStatusLabel(status)}
    </span>
  );
}
