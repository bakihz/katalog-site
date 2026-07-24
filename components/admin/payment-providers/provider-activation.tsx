import { AppButton } from "@/components/ui";
import {
  getProviderMissingFields,
  isProviderReady,
} from "@/lib/paymentProviderAdmin";
import {
  getGatewayHost,
  getProviderStatusClassName,
  getProviderStatusLabel,
} from "./provider-ui";
import type { PaymentProviderRecord } from "./types";

type ProviderActivationProps = {
  providers: PaymentProviderRecord[];
};

export function ProviderActivation({ providers }: ProviderActivationProps) {
  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold">Aktif Sağlayıcı</h3>
      <p className="mt-1 text-sm text-[#68746e]">
        Ödeme ekranının kullanacağı sanal POS&apos;u seçin. Eksik bilgisi olan
        POS aktif edilemez.
      </p>

      {providers.length === 0 ? (
        <div className="mt-4 rounded-[1.75rem] border border-dashed border-[#17201c]/20 bg-[#fcfbf8] p-8 text-sm text-[#68746e]">
          Henüz POS sağlayıcısı tanımlanmamış.
        </div>
      ) : (
        <form
          action="/api/admin/providers/activate"
          method="POST"
          className="mt-4"
        >
          <fieldset className="space-y-3">
            <legend className="sr-only">Sanal POS seçimi</legend>
            {providers.map((provider) => {
              const ready = isProviderReady(provider);
              const missingFields = getProviderMissingFields(provider);
              const gatewayHost = getGatewayHost(provider.gatewayUrl);

              return (
                <label
                  key={provider.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition ${
                    provider.isActive
                      ? "border-emerald-300 bg-emerald-50"
                      : ready
                        ? "border-[#17201c]/10 bg-[#fcfbf8] hover:border-[#173f32]/30"
                        : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="providerId"
                      value={provider.id}
                      defaultChecked={provider.isActive}
                      disabled={!ready}
                      className="h-4 w-4 accent-[#173f32] disabled:cursor-not-allowed"
                    />
                    <div>
                      <p className="text-base font-bold text-[#17201c]">
                        {provider.name}
                      </p>
                      <p className="text-sm text-[#68746e]">
                        {ready
                          ? provider.isActive
                            ? "Aktif sağlayıcı"
                            : "Aktif edilebilir"
                          : `Eksik: ${missingFields.join(", ")}`}
                      </p>
                      <p className="mt-1 text-xs text-[#89938e]">
                        {provider.merchantId
                          ? `Client ID: ${provider.merchantId}`
                          : "Client ID yok"}
                        {gatewayHost ? ` · ${gatewayHost}` : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getProviderStatusClassName(
                      { isActive: provider.isActive, ready },
                    )}`}
                  >
                    {getProviderStatusLabel({
                      isActive: provider.isActive,
                      ready,
                    })}
                  </span>
                </label>
              );
            })}
          </fieldset>
          <AppButton type="submit" className="mt-4">
            Sanal POS&apos;u Güncelle
          </AppButton>
        </form>
      )}
    </section>
  );
}
