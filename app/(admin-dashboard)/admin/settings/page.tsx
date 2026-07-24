import { PageHeader } from "@/components/ui";
import { getFirstSearchParam } from "@/lib/searchParams";

type AdminSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const successMessages: Record<string, string> = {
  password: "Admin şifresi güncellendi. Lütfen yeni şifrenizle tekrar giriş yapın.",
};

const errorMessages: Record<string, string> = {
  password: "Mevcut şifre hatalı veya admin hesabı bulunamadı.",
  "new-password":
    "Yeni şifre en az 10 karakter olmalı ve tekrar alanıyla aynı olmalıdır.",
  missing: "Tüm alanları doldurun.",
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const params = await searchParams;
  const success = getFirstSearchParam(params.success);
  const error = getFirstSearchParam(params.error);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Güvenlik"
        title="Admin Ayarları"
        description="Yönetim paneli erişim şifresini buradan güncelleyebilirsiniz."
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
            : successMessages[success ?? ""]}
        </div>
      )}

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Şifre Değiştir</h3>
        <p className="mt-1 text-sm leading-6 text-[#68746e]">
          Güvenlik için güçlü, tahmin edilmesi zor ve başka sistemlerde
          kullanılmayan bir şifre tercih edin.
        </p>

        <form
          action="/api/admin/settings/password"
          method="POST"
          className="mt-5 grid gap-3"
        >
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Mevcut Şifre
            </span>
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">
                Yeni Şifre
              </span>
              <input
                type="password"
                name="newPassword"
                required
                minLength={10}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-semibold">
                Yeni Şifre Tekrar
              </span>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={10}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 justify-self-start rounded-2xl bg-[#10231d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173f32]"
          >
            Şifreyi Güncelle
          </button>
        </form>
      </section>
    </div>
  );
}
