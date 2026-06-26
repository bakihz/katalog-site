import { prisma } from "@/lib/prisma";

async function getProviders() {
  return prisma.paymentProvider.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export default async function ProvidersPage() {
  const providers = await getProviders();
  const activeProvider = providers.find((provider) => provider.isActive);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2853e]">
          Ödeme Altyapısı
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Sanal POS Yönetimi
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68746e]">
          Aktif sanal POS sağlayıcısını buradan görebilir ve gerektiğinde
          değiştirebilirsin. Mail order / ödeme entegrasyonu şu an ana çalışma
          kapsamımızın dışında, bu yüzden bu ekranda sadece görünüm toparlandı.
        </p>
        <form
          action="/api/admin/providers/seed-ziraat"
          method="POST"
          className="mt-5"
        >
          <button
            type="submit"
            className="rounded-2xl bg-[#10231d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#173f32]"
          >
            Ziraat Test POS Ekle / Aktif Yap
          </button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {providers.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#17201c]/20 bg-white p-8 text-sm text-[#68746e]">
            Henüz POS sağlayıcısı tanımlanmamış.
          </div>
        ) : (
          providers.map((provider) => (
            <article
              key={provider.id}
              className={`rounded-[1.75rem] border bg-white p-6 shadow-sm transition ${
                provider.isActive
                  ? "border-emerald-300 ring-4 ring-emerald-100"
                  : "border-[#17201c]/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938e]">
                    Sağlayıcı
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{provider.name}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    provider.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[#f5f3ee] text-[#68746e]"
                  }`}
                >
                  {provider.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              <dl className="mt-6 grid gap-3 text-sm">
                <div className="rounded-2xl bg-[#f8f6f1] p-4">
                  <dt className="font-semibold text-[#68746e]">Merchant ID</dt>
                  <dd className="mt-1 font-bold">
                    {provider.merchantId || "Tanımlı değil"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#f8f6f1] p-4">
                  <dt className="font-semibold text-[#68746e]">API Kullanıcı</dt>
                  <dd className="mt-1 font-bold">
                    {provider.apiUser || "Tanımlı değil"}
                  </dd>
                </div>
              </dl>

              <form
                action={`/api/providers/${provider.id}/activate`}
                method="POST"
                className="mt-6"
              >
                <button
                  type="submit"
                  disabled={provider.isActive}
                  className="w-full rounded-2xl bg-[#10231d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#173f32] disabled:cursor-not-allowed disabled:bg-[#d8d2c6] disabled:text-[#7a867f]"
                >
                  {provider.isActive ? "Zaten Aktif" : "Aktif Yap"}
                </button>
              </form>
            </article>
          ))
        )}
      </section>

      {activeProvider && (
        <p className="text-sm text-[#68746e]">
          Aktif sağlayıcı:{" "}
          <span className="font-bold text-[#17201c]">{activeProvider.name}</span>
        </p>
      )}
    </div>
  );
}
