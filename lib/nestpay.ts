import crypto from "crypto";

function escapeField(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function getFormValue(
  formFields: FormData | Record<string, string>,
  key: string,
): string {
  if (formFields instanceof FormData) {
    const value = formFields.get(key);
    return typeof value === "string" ? value : "";
  }

  return formFields[key] ?? "";
}

function formDataToRecord(formData: FormData): Record<string, string> {
  const fields: Record<string, string> = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      fields[key] = value;
    }
  });

  return fields;
}

function sha512Base64(value: string): string {
  return crypto.createHash("sha512").update(value).digest("base64");
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
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

  return sha512Base64(plainText);
}

export function verifyNestpayResponseHash(
  formData: FormData,
  storeKey: string | undefined,
): { ok: boolean; reason?: string } {
  if (!storeKey) {
    return { ok: false, reason: "missing_store_key" };
  }

  const receivedHash =
    getFormValue(formData, "HASH") || getFormValue(formData, "hash");

  if (!receivedHash) {
    return { ok: false, reason: "missing_hash" };
  }

  const fields = formDataToRecord(formData);
  const candidates = [generateNestpayHash(fields, storeKey)];

  const hashParams = getFormValue(formData, "HASHPARAMS");
  const hashParamsVal = getFormValue(formData, "HASHPARAMSVAL");

  if (hashParams && hashParamsVal) {
    const paramsVal = hashParams
      .split(":")
      .filter(Boolean)
      .map((key) => getFormValue(formData, key))
      .join("");

    if (paramsVal === hashParamsVal) {
      candidates.push(sha512Base64(paramsVal + storeKey));
    }
  }

  const ok = candidates.some((candidate) => safeCompare(candidate, receivedHash));

  return ok ? { ok: true } : { ok: false, reason: "hash_mismatch" };
}
