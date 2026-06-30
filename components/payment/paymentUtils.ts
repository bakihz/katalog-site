export type PaymentMode = "public" | "agent";
export type FocusedCardField = "pan" | "customerName" | "expiry" | "cv2" | null;

export const MAX_CARD_DIGITS = 16;
export const MAX_CARD_HOLDER_LENGTH = 32;
export const MAX_CVV_DIGITS = 3;
export const MAX_EXPIRY_YEAR_OFFSET = 12;
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export function onlyDigits(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}

export function limitText(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

export function formatCardNumber(value: string) {
  const safeValue = onlyDigits(value, MAX_CARD_DIGITS);
  const maskedValue = Array.from({ length: MAX_CARD_DIGITS }, (_, index) => {
    const digit = safeValue[index];

    if (!digit) {
      return "•";
    }

    if (index < 4 || index >= MAX_CARD_DIGITS - 4) {
      return digit;
    }

    return "*";
  }).join("");

  return maskedValue.match(/.{1,4}/g)?.join(" ") ?? "";
}

export function formatCardInput(value: string) {
  return onlyDigits(value, MAX_CARD_DIGITS)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(month: string, year: string) {
  const safeMonth = month || "AA";
  const safeYear = year || "YY";
  return `${safeMonth.padEnd(2, "A")}/${safeYear.padEnd(2, "Y")}`;
}

export function normalizeExpiryYear(year: string) {
  const twoDigitYear = onlyDigits(year, 2);
  return twoDigitYear.length === 2 ? `20${twoDigitYear}` : twoDigitYear;
}

export function isValidExpiryYear(year: string, currentYear: number) {
  const fullYear = Number(normalizeExpiryYear(year));
  return (
    fullYear >= currentYear && fullYear <= currentYear + MAX_EXPIRY_YEAR_OFFSET
  );
}

export function getExpiryYearOptions(currentYear: number) {
  return Array.from({ length: MAX_EXPIRY_YEAR_OFFSET + 1 }, (_, index) =>
    String(currentYear + index).slice(-2),
  );
}
