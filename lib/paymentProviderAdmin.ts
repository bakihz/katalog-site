export type PaymentProviderReadiness = {
  name: string | null;
  merchantId: string | null;
  storeKey: string | null;
  gatewayUrl: string | null;
};

const requiredFieldLabels: Array<{
  key: keyof PaymentProviderReadiness;
  label: string;
}> = [
  { key: "name", label: "POS adı" },
  { key: "merchantId", label: "Client ID / Üye İşyeri No" },
  { key: "storeKey", label: "Store Key" },
  { key: "gatewayUrl", label: "Gateway URL" },
];

export function getProviderMissingFields(provider: PaymentProviderReadiness) {
  return requiredFieldLabels
    .filter(({ key }) => !provider[key]?.trim())
    .map(({ label }) => label);
}

export function isProviderReady(provider: PaymentProviderReadiness) {
  return getProviderMissingFields(provider).length === 0;
}

export function readProviderFormValue(
  formData: FormData,
  key: string,
): string {
  return String(formData.get(key) ?? "").trim();
}

export function isValidHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
