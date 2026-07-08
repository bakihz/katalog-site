export function maskCardNumber(pan: string) {
  const digits = pan.replace(/\D/g, "");

  if (digits.length < 8) {
    return null;
  }

  return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`;
}

export function getPaymentCardMasked(payment: unknown) {
  if (
    payment &&
    typeof payment === "object" &&
    "cardMasked" in payment &&
    typeof payment.cardMasked === "string"
  ) {
    return payment.cardMasked;
  }

  return null;
}
