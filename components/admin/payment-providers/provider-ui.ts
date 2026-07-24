export type ProviderStatusInput = {
  isActive: boolean;
  ready: boolean;
};

export const providerInputClassName =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

export const providerLabelClassName =
  "mb-1 block text-xs font-semibold text-[#68746e]";

export const providerHelperTextClassName =
  "mt-1 text-xs leading-relaxed text-[#7a867f]";

export function getGatewayHost(gatewayUrl: string | null) {
  if (!gatewayUrl) {
    return null;
  }

  try {
    return new URL(gatewayUrl).host;
  } catch {
    return gatewayUrl;
  }
}

export function getProviderStatusLabel({
  isActive,
  ready,
}: ProviderStatusInput) {
  if (isActive) {
    return "Aktif";
  }

  return ready ? "Hazır" : "Eksik";
}

export function getProviderStatusClassName({
  isActive,
  ready,
}: ProviderStatusInput) {
  if (isActive) {
    return "bg-emerald-100 text-emerald-700";
  }

  return ready
    ? "bg-slate-100 text-slate-700"
    : "bg-amber-100 text-amber-700";
}
