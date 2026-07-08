import { prisma } from "@/lib/prisma";
import { ensureAllPaymentProviders } from "@/lib/paymentProviders";
import { AppButton, PageHeader } from "@/components/ui";

type ProvidersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const successMessages: Record<string, string> = {
  created: "Sanal POS eklendi.",
  updated: "Sanal POS bilgileri güncellendi.",
  deleted: "Sanal POS silindi.",
};

const errorMessages: Record<string, string> = {
  "create-name": "POS adı zorunludur.",
  "create-duplicate": "Bu isimde bir sanal POS zaten mevcut.",
  "update-name": "POS adı zorunludur.",
  "update-notfound": "Sanal POS bulunamadı.",
  "delete-notfound": "Sanal POS bulunamadı.",
};

const inputCls =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

const labelCls = "block text-xs font-semibold text-[#68746e] mb-1";

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

      {/* Aktif POS seçimi */}
      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Aktif Sağlayıcı</h3>
        <p className="mt-1 text-sm text-[#68746e]">
          Ödeme ekranının kullanacağı sanal POS&apos;u seçin.
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
              {providers.map((provider) => (
                <label
                  key={provider.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition ${
                    provider.isActive
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-[#17201c]/10 bg-[#fcfbf8] hover:border-[#173f32]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="providerId"
                      value={provider.id}
                      defaultChecked={provider.isActive}
                      className="h-4 w-4 accent-[#173f32]"
                    />
                    <div>
                      <p className="text-base font-bold text-[#17201c]">
                        {provider.name}
                      </p>
                      <p className="text-sm text-[#68746e]">
                        {provider.isActive ? "Aktif sağlayıcı" : "Seçilebilir"}
                      </p>
                    </div>
                  </div>
                  {provider.isActive && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Aktif
                    </span>
                  )}
                </label>
              ))}
            </fieldset>
            <AppButton type="submit" className="mt-4">
              Sanal POS&apos;u Güncelle
            </AppButton>
          </form>
        )}
      </section>

      {/* Sağlayıcı düzenleme */}
      {providers.map((provider) => (
        <section
          key={provider.id}
          className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">{provider.name}</h3>
              <p className="text-sm text-[#68746e]">
                {provider.merchantId
                  ? `Client ID: ${provider.merchantId}`
                  : "Kimlik bilgileri girilmemiş"}
              </p>
            </div>
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
              </div>
              <div>
                <label className={labelCls}>Client ID / Üye İşyeri No</label>
                <input
                  name="merchantId"
                  defaultValue={provider.merchantId ?? ""}
                  className={inputCls}
                  placeholder="700100000"
                />
              </div>
              <div>
                <label className={labelCls}>Store Key</label>
                <input
                  name="storeKey"
                  defaultValue={provider.storeKey ?? ""}
                  className={inputCls}
                  placeholder="STOREKEY..."
                />
              </div>
              <div>
                <label className={labelCls}>Gateway URL</label>
                <input
                  name="gatewayUrl"
                  defaultValue={provider.gatewayUrl ?? ""}
                  className={inputCls}
                  placeholder="https://entegrasyon.asseco-see.com.tr/fim/est3Dgate"
                />
              </div>
              <div>
                <label className={labelCls}>API Kullanıcı</label>
                <input
                  name="apiUser"
                  defaultValue={provider.apiUser ?? ""}
                  className={inputCls}
                  placeholder="APIUSER"
                />
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
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-3 lg:col-span-2">
                <AppButton type="submit">Kaydet</AppButton>
                <form
                  action={`/api/admin/providers/${provider.id}/delete`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Sil
                  </button>
                </form>
              </div>
            </form>
          </details>
        </section>
      ))}

      {/* Yeni sağlayıcı ekle */}
      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Sanal POS Ekle</h3>
        <p className="mt-1 text-sm text-[#68746e]">
          Yeni bir sanal POS sağlayıcısı tanımlayın.
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
          </div>
          <div>
            <label className={labelCls}>Client ID / Üye İşyeri No</label>
            <input
              name="merchantId"
              className={inputCls}
              placeholder="700100000"
            />
          </div>
          <div>
            <label className={labelCls}>Store Key</label>
            <input
              name="storeKey"
              className={inputCls}
              placeholder="STOREKEY..."
            />
          </div>
          <div>
            <label className={labelCls}>Gateway URL</label>
            <input
              name="gatewayUrl"
              className={inputCls}
              placeholder="https://entegrasyon.asseco-see.com.tr/fim/est3Dgate"
            />
          </div>
          <div>
            <label className={labelCls}>API Kullanıcı</label>
            <input
              name="apiUser"
              className={inputCls}
              placeholder="APIUSER"
            />
          </div>
          <div>
            <label className={labelCls}>API Şifresi</label>
            <input
              name="apiPassword"
              type="password"
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          <div className="lg:col-span-2">
            <AppButton type="submit">Ekle</AppButton>
          </div>
        </form>
      </section>
    </div>
  );
}

