export function generateOrderId() {
  const now = Date.now();

  const random = Math.floor(Math.random() * 10000);

  return `PAY-${now}-${random}`;
}
