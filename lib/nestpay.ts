import crypto from "crypto";

export function generateNestpayHash({
  clientId,
  orderId,
  amount,
  okUrl,
  failUrl,
  transactionType,
  instalment,
  rnd,
  currency,
  storeKey,
}: {
  clientId: string;
  orderId: string;
  amount: string;
  okUrl: string;
  failUrl: string;
  transactionType: string;
  instalment: string;
  rnd: string;
  currency: string;
  storeKey: string;
}) {
  const plainText =
    clientId +
    orderId +
    amount +
    okUrl +
    failUrl +
    transactionType +
    instalment +
    rnd +
    storeKey;

  return crypto
    .createHash("sha512")
    .update(plainText, "ascii")
    .digest("base64");
}
