import { PageHeader } from "@/components/ui";
import { getSiteSettings } from "@/lib/siteSettings";
import { getFirstSearchParam } from "@/lib/searchParams";

type SiteSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClassName =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

export default async function SiteSettingsPage({
  searchParams,
}: SiteSettingsPageProps) {
  const [settings, params] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);
  const success = getFirstSearchParam(params.success);
  const error = getFirstSearchParam(params.error);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Site Yönetimi"
        title="Genel Site Ayarları"
        description="Şirket bilgilerini, katalog ana sayfası metinlerini ve temel görünürlük seçeneklerini kod değişikliği yapmadan yönetin."
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
            ? "Bilgiler kaydedilemedi. Zorunlu alanları ve bağlantıları kontrol edin."
            : "Site ayarları başarıyla güncellendi."}
        </div>
      )}

      <form action="/api/admin/site-settings" method="POST" className="space-y-6">
        <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold">Şirket ve İletişim</h3>
            <p className="mt-1 text-sm leading-6 text-[#68746e]">
              Bu bilgiler katalog ve iletişim alanlarında kullanılır.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Şirket Adı *</span>
              <input className={inputClassName} name="companyName" required maxLength={200} defaultValue={settings.companyName} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Birincil Telefon *</span>
              <input className={inputClassName} name="primaryPhone" required maxLength={50} inputMode="tel" defaultValue={settings.primaryPhone} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">İkinci Telefon</span>
              <input className={inputClassName} name="secondaryPhone" maxLength={50} inputMode="tel" defaultValue={settings.secondaryPhone ?? ""} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">E-posta *</span>
              <input className={inputClassName} type="email" name="email" required maxLength={320} defaultValue={settings.email} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">WhatsApp Numarası</span>
              <input className={inputClassName} name="whatsappPhone" maxLength={50} inputMode="tel" placeholder="905443033366" defaultValue={settings.whatsappPhone ?? ""} />
            </label>
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Adres</span>
              <textarea className={`${inputClassName} min-h-24 resize-y`} name="address" maxLength={500} defaultValue={settings.address ?? ""} />
            </label>
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Google Haritalar Bağlantısı</span>
              <input className={inputClassName} type="url" name="mapsUrl" maxLength={1000} placeholder="https://..." defaultValue={settings.mapsUrl ?? ""} />
            </label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold">Katalog Ana Sayfası</h3>
            <p className="mt-1 text-sm leading-6 text-[#68746e]">
              Katalog girişindeki karşılama metinlerini ve listeleme davranışını belirleyin.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Üst Etiket *</span>
              <input className={inputClassName} name="heroBadge" required maxLength={120} defaultValue={settings.heroBadge} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Ana Başlık *</span>
              <input className={inputClassName} name="heroTitle" required maxLength={160} defaultValue={settings.heroTitle} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Vurgulu Başlık *</span>
              <input className={inputClassName} name="heroHighlight" required maxLength={160} defaultValue={settings.heroHighlight} />
            </label>
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Açıklama *</span>
              <textarea className={`${inputClassName} min-h-28 resize-y`} name="heroDescription" required maxLength={600} defaultValue={settings.heroDescription} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Sayfa Başına Ürün</span>
              <select className={inputClassName} name="catalogPageSize" defaultValue={String(settings.catalogPageSize)}>
                {[12, 24, 36, 48].map((size) => <option key={size} value={size}>{size} ürün</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 self-end rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3">
              <input type="checkbox" name="showAgentLogin" defaultChecked={settings.showAgentLogin} className="size-4 accent-[#173f32]" />
              <span className="text-sm font-semibold">Temsilci giriş butonunu göster</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" className="rounded-2xl bg-[#10231d] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#10231d]/15 transition hover:bg-[#173f32]">
            Ayarları Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
