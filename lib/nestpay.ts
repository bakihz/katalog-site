import crypto from "crypto";

function escapeField(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

/**
 * NestPay ver3 hash:
 * Sort ALL form fields alphabetically (case-insensitive),
 * exclude 'hash', 'encoding', 'nationalidno',
 * append storeKey at end, escape \ and | in values, join with |, SHA-512 base64.
 */
export function generateNestpayHash(
  formFields: Record<string, string>,
  storeKey: string,
): string {
  const excluded = ["hash", "encoding", "nationalidno"];

  const sortedKeys = Object.keys(formFields)
    .filter((k) => !excluded.includes(k.toLowerCase()))
    .sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      if (al < bl) return -1;
      if (al > bl) return 1;
      return 0;
    });

  const values = sortedKeys.map((k) => formFields[k]);
  values.push(storeKey);

  const plainText = values.map(escapeField).join("|");

  console.log("[HASH DEBUG] sortedKeys:", sortedKeys);
  console.log("[HASH DEBUG] plainText:", plainText);

  const hash = crypto.createHash("sha512").update(plainText).digest("base64");

  console.log("[HASH DEBUG] hash:", hash);

  return hash;
}
