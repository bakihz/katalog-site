import { isProviderReady } from "@/lib/paymentProviderAdmin";
import type { PaymentProviderRecord } from "./types";

type ProviderOverviewProps = {
  providers: PaymentProviderRecord[];
};

export function ProviderOverview({ providers }: ProviderOverviewProps) {
  const activeProvider = providers.find((provider) => provider.isActive);
  const readyProviderCount = providers.filter((provider) =>
    isProviderReady(provider),
  ).length;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#89938e]">
          Aktif POS
        </p>
        <p className="mt-2 text-xl font-black text-[#17201c]">
          {activeProvider?.name ?? "Seçilmedi"}
        </p>
        <p className="mt-1 text-sm text-[#68746e]">
          {activeProvider
            ? "Ödeme ekranı şu anda bu sağlayıcıyı kullanıyor."
            : "Ödeme almadan önce hazır bir POS aktif edilmeli."}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[#17201c]/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#89938e]">
          Hazır POS
        </p>
        <p className="mt-2 text-xl font-black text-[#17201c]">
          {readyProviderCount} / {providers.length}
        </p>
        <p className="mt-1 text-sm text-[#68746e]">
          POS adı, Client ID, Store Key ve Gateway URL dolu olan kayıtlar aktif
          edilebilir.
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
          Güvenlik Notu
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Store Key ve API şifresi ekranda gösterilmez. Güncellemede boş
          bırakırsan mevcut kayıt korunur.
        </p>
      </div>
    </section>
  );
}
