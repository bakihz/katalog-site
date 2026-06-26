import crypto from "crypto";

export function generateNestpayHash({
  clientId,
  orderId,
  amount,
  okUrl,
  failUrl,
  rnd,
  storeKey,
}: {
  clientId: string;
  orderId: string;
  amount: string;
  okUrl: string;
  failUrl: string;
  rnd: string;
  storeKey: string;
}) {
  // Formula: clientid + oid + amount + okUrl + failUrl + rnd + storekey
  const plainText =
    clientId +
    orderId +
    amount +
    okUrl +
    failUrl +
    rnd +
    storeKey;

  console.log("[HASH DEBUG] plainText:", plainText);

  const variants = {
    "7f-b64": crypto.createHash("sha512").update(plainText, "utf8").digest("base64"),
    "9f-b64": crypto.createHash("sha512").update(
      clientId + orderId + amount + okUrl + failUrl + "Auth" + "" + rnd + storeKey, "utf8"
    ).digest("base64"),
  };
  console.log("[HASH VARIANTS]", JSON.stringify(variants));

  const hash = variants["9f-b64"];

  console.log("[HASH DEBUG] hash:", hash);

  return hash;
}
