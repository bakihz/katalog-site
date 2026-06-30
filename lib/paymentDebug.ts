export function logPaymentDebug(
  label: string,
  details: Record<string, unknown>,
) {
  const shouldLog =
    process.env.NODE_ENV !== "production" ||
    process.env.PAYMENT_DEBUG_LOGS === "true";

  if (shouldLog) {
    console.info(label, details);
  }
}
