export function formatCurrency(value: number) {
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
}

export function formatNumber(value: number) {
  return value.toLocaleString("tr-TR");
}

export function formatDateTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Date(value).toLocaleString("tr-TR", options);
}

export function formatAmountWithCurrencySuffix(value: number) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}
