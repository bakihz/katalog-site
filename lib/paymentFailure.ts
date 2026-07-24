export function getPaymentFailureDetails(formData: FormData) {
  const errorMessage = normalizePaymentFailureMessage(
    getFormString(formData, "ErrMsg") ||
      getFormString(formData, "errmsg") ||
      getFormString(formData, "mdErrorMsg") ||
      getFormString(formData, "Response"),
  );

  const errorCode =
    getFormString(formData, "ErrorCode") ||
    getFormString(formData, "ProcReturnCode") ||
    getFormString(formData, "mdStatus");

  return {
    errorCode: errorCode || null,
    errorMessage: errorMessage || null,
  };
}

export async function parsePaymentCallbackFormData(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType
    .toLocaleLowerCase("en-US")
    .includes("application/x-www-form-urlencoded")) {
    return request.formData();
  }

  const body = new Uint8Array(await request.arrayBuffer());
  const formData = new FormData();
  const charset = getDeclaredCharset(contentType);

  for (const field of splitBytes(body, 0x26)) {
    if (field.length === 0) continue;

    const separatorIndex = field.indexOf(0x3d);
    const keyBytes =
      separatorIndex === -1 ? field : field.slice(0, separatorIndex);
    const valueBytes =
      separatorIndex === -1 ? new Uint8Array() : field.slice(separatorIndex + 1);

    const key = decodeFormComponent(keyBytes, charset);
    const value = decodeFormComponent(valueBytes, charset);
    formData.append(key, value);
  }

  return formData;
}

export function normalizePaymentFailureMessage(
  value: string | null | undefined,
) {
  const message = String(value ?? "").trim();
  if (!message) return "";

  if (message.includes("\uFFFD")) {
    const searchable = message
      .replace(/\uFFFD+/g, " ")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("tr-TR");

    if (
      searchable.includes("kart") &&
      searchable.includes("e-ticaret") &&
      searchable.includes("lemlerine kapal") &&
      searchable.includes("bankan") &&
      searchable.includes("aray") &&
      searchable.includes("iso8583-93")
    ) {
      return "Kartınız e-ticaret işlemlerine kapalıdır. Bankanızı arayınız. (ISO8583-93)";
    }
  }

  return message;
}

export function getFailureRedirectUrl({
  baseUrl,
  paymentId,
  formData,
}: {
  baseUrl: string;
  paymentId: number | null | undefined;
  formData: FormData;
}) {
  if (!paymentId) return `${baseUrl}/panel/odeme?error=1`;

  const { errorCode, errorMessage } = getPaymentFailureDetails(formData);
  const params = new URLSearchParams();

  if (errorMessage) params.set("err", errorMessage);
  if (errorCode) params.set("code", errorCode);

  const queryString = params.toString();
  return `${baseUrl}/panel/odeme/basarisiz/${paymentId}${
    queryString ? `?${queryString}` : ""
  }`;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function splitBytes(input: Uint8Array, separator: number) {
  const parts: Uint8Array[] = [];
  let start = 0;

  for (let index = 0; index <= input.length; index += 1) {
    if (index === input.length || input[index] === separator) {
      parts.push(input.slice(start, index));
      start = index + 1;
    }
  }

  return parts;
}

function getDeclaredCharset(contentType: string) {
  const match = contentType.match(/charset\s*=\s*["']?([^;"'\s]+)/i);
  return match?.[1]?.toLocaleLowerCase("en-US") ?? "";
}

function decodeFormComponent(input: Uint8Array, charset: string) {
  const bytes: number[] = [];

  for (let index = 0; index < input.length; index += 1) {
    const byte = input[index];

    if (byte === 0x2b) {
      bytes.push(0x20);
      continue;
    }

    if (byte === 0x25 && index + 2 < input.length) {
      const high = fromHex(input[index + 1]);
      const low = fromHex(input[index + 2]);

      if (high !== -1 && low !== -1) {
        bytes.push(high * 16 + low);
        index += 2;
        continue;
      }
    }

    bytes.push(byte);
  }

  const decodedBytes = Uint8Array.from(bytes);
  const isTurkishLegacyCharset =
    charset.includes("8859-9") ||
    charset.includes("windows-1254") ||
    charset.includes("cp1254");

  if (isTurkishLegacyCharset) {
    return new TextDecoder("windows-1254").decode(decodedBytes);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(decodedBytes);
  } catch {
    return new TextDecoder("windows-1254").decode(decodedBytes);
  }
}

function fromHex(byte: number) {
  if (byte >= 0x30 && byte <= 0x39) return byte - 0x30;
  if (byte >= 0x41 && byte <= 0x46) return byte - 0x41 + 10;
  if (byte >= 0x61 && byte <= 0x66) return byte - 0x61 + 10;
  return -1;
}
