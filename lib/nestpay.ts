import crypto from "crypto";

export function generateNestpayHash({
  clientId,
  orderId,
  amount,
  okUrl,
  failUrl,
  callbackUrl,
  transactionType,
  instalment,
  rnd,
  storeKey,
}: {
  clientId: string;
  orderId: string;
  amount: string;
  okUrl: string;
  failUrl: string;
  callbackUrl: string;
  transactionType: string;
  instalment: string;
  rnd: string;
  storeKey: string;
}) {
  const plainText =
    clientId +
    orderId +
    amount +
    okUrl +
    failUrl +
    callbackUrl +
    transactionType +
    instalment +
    rnd +
    storeKey;

  return crypto.createHash("sha1").update(plainText, "utf8").digest("base64");
}
