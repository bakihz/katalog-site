import { prisma } from "@/lib/prisma";
import { ensureAllPaymentProviders } from "@/lib/paymentProviders";
import {
  getProviderMissingFields,
  isProviderReady,
} from "@/lib/paymentProviderAdmin";
import { AppButton, PageHeader } from "@/components/ui";

type ProvidersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ProviderStatusInput = {
  isActive: boolean;
  ready: boolean;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getGatewayHost(gatewayUrl: string | null) {
  if (!gatewayUrl) {
    return null;
  }

  try {
    return new URL(gatewayUrl).host;
  } catch {
    return gatewayUrl;
  }
}

function getProviderStatusLabel({ isActive, ready }: ProviderStatusInput) {
  if (isActive) {
    return "Aktif";
  }

  return ready ? "Hazır" : "Eksik";
}

function getProviderStatusClassName({ isActive, ready }: ProviderStatusInput) {
  if (isActive) {
    return "bg-emerald-100 text-emerald-700";
  }

  return ready ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700";
}

const successMessages: Record<string, string> = {
  created: "Sanal POS eklendi.",
  updated: "Sanal POS bilgileri güncellendi.",
  deleted: "Sanal POS silindi.",
};

const errorMessages: Record<string, string> = {
  "create-name": "POS adı zorunludur.",
  "create-duplicate": "Bu isimde bir sanal POS zaten mevcut.",
  "create-gateway":
    "Gateway URL http veya https ile başlayan geçerli bir adres olmalıdır.",
  "update-name": "POS adı zorunludur.",
  "update-duplicate": "Bu isimde başka bir sanal POS zaten mevcut.",
  "update-gateway":
    "Gateway URL http veya https ile başlayan geçerli bir adres olmalıdır.",
  "update-active-incomplete":
    "Aktif sanal POS'un zorunlu bilgileri boş bırakılamaz.",
  "update-notfound": "Sanal POS bulunamadı.",
  "activate-notfound": "Seçilen sanal POS bulunamadı.",
  "activate-incomplete":
    "Bu sanal POS aktif edilemez; önce POS adı, Client ID, Store Key ve Gateway URL alanlarını tamamlayın.",
  "delete-active":
    "Aktif sanal POS silinemez. Önce farklı bir POS'u aktif edin.",
  "delete-notfound": "Sanal POS bulunamadı.",
};

const inputCls =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

const labelCls = "block text-xs font-semibold text-[#68746e] mb-1";
const helperTextCls = "mt-1 text-xs leading-relaxed text-[#7a867f]";

async function getProviders() {
  await ensureAllPaymentProviders();
  return prisma.paymentProvider.findMany({ orderBy: { id: "asc" } });
}

export default async function ProvidersPage({
  searchParams,
}: ProvidersPageProps) {
  const params = await searchParams;
  const success = getFirstParam(params.success);
  const error = getFirstParam(params.error);
  const providers = await getProviders();
  const activeProvider = providers.find((provider) => provider.isActive);
  const readyProviderCount = providers.filter((provider) =>
    isProviderReady(provider),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ödeme Altyapısı"
        title="Sanal POS Yönetimi"
        description="Sanal POS sağlayıcılarını ekle, düzenle ve aktif olanı seç."
      />

      {(success || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error
            ? (errorMessages[error] ?? "İşlem sırasında hata oluştu.")
            : (successMessages[success ?? ""] ?? "İşlem başarılı.")}
        </div>
      )}

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
            POS adı, Client ID, Store Key ve Gateway URL dolu olan kayıtlar
            aktif edilebilir.
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

      {providers.map((provider) => {
        const ready = isProviderReady(provider);
        const missingFields = getProviderMissingFields(provider);
        const editFormId = `provider-edit-${provider.id}`;

        return (
          <section
            key={provider.id}
            className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold">{provider.name}</h3>
                <p className="text-sm text-[#68746e]">
                  {provider.merchantId
                    ? `Client ID: ${provider.merchantId}`
                    : "Client ID girilmemiş"}
                </p>
                {!ready && (
                  <p className="mt-1 text-sm font-semibold text-amber-700">
                    Eksik alanlar: {missingFields.join(", ")}
                  </p>
                )}
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getProviderStatusClassName(
                  { isActive: provider.isActive, ready },
                )}`}
              >
                {getProviderStatusLabel({
                  isActive: provider.isActive,
                  ready,
                })}
              </span>
            </div>

            <details className="group mt-4">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-2.5 text-sm font-semibold text-[#17201c] transition hover:bg-[#f0ece4] [&::-webkit-details-marker]:hidden">
                <span>Değiştir</span>
                <svg
                  className="h-4 w-4 transition group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>

              <form
                id={editFormId}
                action={`/api/admin/providers/${provider.id}/update`}
                method="POST"
                className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
              >
                <div>
                  <label className={labelCls}>Ad</label>
                  <input
                    name="name"
                    required
                    defaultValue={provider.name}
                    className={inputCls}
                    placeholder="Ziraat Sanal POS"
                  />
                  <p className={helperTextCls}>
                    Panelde ve ödeme kayıtlarında görünecek sağlayıcı adı.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Client ID / Üye İşyeri No</label>
                  <input
                    name="merchantId"
                    defaultValue={provider.merchantId ?? ""}
                    className={inputCls}
                    placeholder="700100000"
                    inputMode="numeric"
                  />
                  <p className={helperTextCls}>
                    Bankanın verdiği üye işyeri numarasıdır.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>
                    Store Key{" "}
                    <span className="font-normal text-[#89938e]">
                      (boş bırakırsan değişmez)
                    </span>
                  </label>
                  <input
                    name="storeKey"
                    type="password"
                    className={inputCls}
                    autoComplete="new-password"
                    placeholder={
                      provider.storeKey ? "Kayıtlı store key mevcut" : "STOREKEY..."
                    }
                  />
                  <p className={helperTextCls}>
                    Hash doğrulaması için kullanılır. Boş bırakılırsa mevcut
                    değer korunur.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Gateway URL</label>
                  <input
                    name="gatewayUrl"
                    type="url"
                    defaultValue={provider.gatewayUrl ?? ""}
                    className={inputCls}
                    placeholder="https://entegrasyon.asseco-see.com.tr/fim/est3Dgate"
                  />
                  <p className={helperTextCls}>
                    Müşterinin kart doğrulamasına yönleneceği banka adresi.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>API Kullanıcı</label>
                  <input
                    name="apiUser"
                    defaultValue={provider.apiUser ?? ""}
                    className={inputCls}
                    placeholder="APIUSER"
                    autoComplete="off"
                  />
                  <p className={helperTextCls}>
                    Kullanılmıyorsa boş kalabilir; gerektiğinde bankanın verdiği
                    değer yazılır.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>
                    API Şifresi{" "}
                    <span className="font-normal text-[#89938e]">
                      (boş bırakırsan değişmez)
                    </span>
                  </label>
                  <input
                    name="apiPassword"
                    type="password"
                    className={inputCls}
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                  <p className={helperTextCls}>
                    Boş bırakılırsa mevcut değer korunur.
                  </p>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AppButton type="submit" form={editFormId}>
                  Kaydet
                </AppButton>
                <form
                  action={`/api/admin/providers/${provider.id}/delete`}
                  method="POST"
                >
                  <button
                    type="submit"
                    disabled={provider.isActive}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {provider.isActive ? "Aktif POS Silinemez" : "Sil"}
                  </button>
                </form>
              </div>
            </details>
          </section>
        );
      })}

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Sanal POS Ekle</h3>
        <p className="mt-1 text-sm text-[#68746e]">
          Yeni bir sanal POS sağlayıcısı tanımlayın. Eklenen POS pasif başlar;
          bilgileri tamamlandıktan sonra aktif edilebilir.
        </p>

        <form
          action="/api/admin/providers/create"
          method="POST"
          className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <div>
            <label className={labelCls}>Ad</label>
            <input
              name="name"
              required
              className={inputCls}
              placeholder="Ziraat Sanal POS"
            />
            <p className={helperTextCls}>
              Örn: Ziraat Sanal POS, Halkbank Sanal POS.
            </p>
          </div>
          <div>
            <label className={labelCls}>Client ID / Üye İşyeri No</label>
            <input
              name="merchantId"
              className={inputCls}
              placeholder="700100000"
              inputMode="numeric"
            />
            <p className={helperTextCls}>POS aktif etmek için zorunludur.</p>
          </div>
          <div>
            <label className={labelCls}>Store Key</label>
            <input
              name="storeKey"
              type="password"
              className={inputCls}
              placeholder="STOREKEY..."
              autoComplete="new-password"
            />
            <p className={helperTextCls}>POS aktif etmek için zorunludur.</p>
          </div>
          <div>
            <label className={labelCls}>Gateway URL</label>
            <input
              name="gatewayUrl"
              type="url"
              className={inputCls}
              placeholder="https://entegrasyon.asseco-see.com.tr/fim/est3Dgate"
            />
            <p className={helperTextCls}>POS aktif etmek için zorunludur.</p>
          </div>
          <div>
            <label className={labelCls}>API Kullanıcı</label>
            <input
              name="apiUser"
              className={inputCls}
              placeholder="APIUSER"
              autoComplete="off"
            />
            <p className={helperTextCls}>Bankaya göre opsiyonel olabilir.</p>
          </div>
          <div>
            <label className={labelCls}>API Şifresi</label>
            <input
              name="apiPassword"
              type="password"
              className={inputCls}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <p className={helperTextCls}>Bankaya göre opsiyonel olabilir.</p>
          </div>

          <div className="lg:col-span-2">
            <AppButton type="submit">Ekle</AppButton>
          </div>
        </form>
      </section>
    </div>
  );
}
