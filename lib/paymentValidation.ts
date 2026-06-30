const maxPaymentAmount = Number(process.env.PAYMENT_MAX_AMOUNT ?? 1_000_000);
const maxExpiryYearOffset = 12;

type PaymentRequestBody = {
  amount?: unknown;
  customerName?: unknown;
  companyName?: unknown;
  description?: unknown;
  pan?: unknown;
  cv2?: unknown;
  expMonth?: unknown;
  expYear?: unknown;
};

export type ValidatedPaymentInput = {
  amount: string;
  amountNumber: number;
  customerName: string;
  companyName: string;
  description: string;
  pan: string;
  cv2: string;
  expMonth: string;
  expYear: string;
};

export function validatePaymentInput(
  body: PaymentRequestBody,
): { ok: true; data: ValidatedPaymentInput } | { ok: false; message: string } {
  const amountNumber = Number(body.amount);

  if (
    !Number.isFinite(amountNumber) ||
    amountNumber < 1 ||
    amountNumber > maxPaymentAmount
  ) {
    return {
      ok: false,
      message: `Tutar 1 TL ile ${maxPaymentAmount.toLocaleString("tr-TR")} TL arasında olmalı.`,
    };
  }

  const customerName = cleanText(body.customerName, 64);
  const companyName = cleanText(body.companyName, 96);
  const description = cleanText(body.description, 240);
  const pan = onlyDigits(body.pan);
  const cv2 = onlyDigits(body.cv2);
  const expMonth = onlyDigits(body.expMonth).padStart(2, "0");
  const expYear = normalizeExpiryYear(body.expYear);
  const currentYear = new Date().getFullYear();

  if (!customerName) {
    return { ok: false, message: "Kart üzerindeki ad soyad zorunludur." };
  }

  if (!companyName) {
    return { ok: false, message: "Firma / cari adı zorunludur." };
  }

  if (pan.length !== 16) {
    return { ok: false, message: "Kart numarası 16 hane olmalıdır." };
  }

  if (cv2.length !== 3) {
    return { ok: false, message: "CVV 3 hane olmalıdır." };
  }

  if (!/^(0[1-9]|1[0-2])$/.test(expMonth)) {
    return { ok: false, message: "Son kullanma ayı 01 ile 12 arasında olmalıdır." };
  }

  const expYearNumber = Number(expYear);
  if (
    !Number.isInteger(expYearNumber) ||
    expYearNumber < currentYear ||
    expYearNumber > currentYear + maxExpiryYearOffset
  ) {
    return {
      ok: false,
      message: `Son kullanma yılı ${currentYear} ile ${
        currentYear + maxExpiryYearOffset
      } arasında olmalıdır.`,
    };
  }

  return {
    ok: true,
    data: {
      amount: amountNumber.toFixed(2),
      amountNumber,
      customerName,
      companyName,
      description,
      pan,
      cv2,
      expMonth,
      expYear,
    },
  };
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function onlyDigits(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function normalizeExpiryYear(value: unknown) {
  const digits = onlyDigits(value);

  if (digits.length === 2) {
    return `20${digits}`;
  }

  return digits.slice(0, 4);
}
