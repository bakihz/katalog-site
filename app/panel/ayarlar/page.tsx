import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { AppButton, PageHeader, StatCard } from "@/components/ui";

type AgentSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const successMessages: Record<string, string> = {
  profile: "Kullanıcı adı güncellendi.",
  password: "Şifreniz güncellendi.",
};

const errorMessages: Record<string, string> = {
  profile: "Kullanıcı adı güncellenemedi. Tüm alanları doldurun.",
  password: "Mevcut şifre hatalı veya hesabınız aktif değil.",
  duplicate: "Bu kullanıcı adı başka bir temsilci tarafından kullanılıyor.",
  "new-password":
    "Yeni şifre en az 8 karakter olmalı ve tekrar alanıyla aynı olmalı.",
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgentSettingsPage({
  searchParams,
}: AgentSettingsPageProps) {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) return null;

  const [params, agent, paymentStats] = await Promise.all([
    searchParams,
    prisma.user.findUnique({
      where: { id: agentId },
      include: { _count: { select: { payments: true } } },
    }),
    prisma.payment.aggregate({
      where: { agentId },
      _sum: { amount: true },
    }),
  ]);

  if (!agent) return null;

  const success = getFirstParam(params.success);
  const error = getFirstParam(params.error);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hesap"
        title="Ayarlar"
        description="Kendi temsilci hesabınızın kullanıcı adını ve şifresini buradan güncelleyebilirsiniz."
        aside={
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <StatCard
              label="İşlem"
              value={formatNumber(agent._count.payments)}
              className="bg-[#f5f3ee] p-4 shadow-none"
            />
            <StatCard
              label="Durum"
              value={agent.isActive ? "Aktif" : "Pasif"}
              className={
                agent.isActive
                  ? "bg-emerald-50 p-4 text-emerald-800 shadow-none"
                  : "bg-red-50 p-4 text-red-800 shadow-none"
              }
            />
          </div>
        }
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

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Profil Bilgileri</h3>
            <p className="mt-1 text-sm text-[#68746e]">
              Kullanıcı adı değişikliği için mevcut şifrenizi girmeniz gerekir.
              Ad soyad bilginizi yalnızca yönetici değiştirebilir.
            </p>

            <form
              action="/api/agent/settings/profile"
              method="POST"
              className="mt-5 grid gap-3"
            >
              <label>
                <span className="mb-1.5 block text-sm font-semibold">
                  Kullanıcı Adı
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  defaultValue={agent.username}
                  className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold">
                  Mevcut Şifre
                </span>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="Değişikliği onaylamak için mevcut şifre"
                  className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                />
              </label>

              <AppButton type="submit" size="lg" className="justify-self-start">
                Kullanıcı Adını Kaydet
              </AppButton>
            </form>
          </section>

          <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Şifre Değiştir</h3>
            <p className="mt-1 text-sm text-[#68746e]">
              Yeni şifre en az 8 karakter olmalıdır. Güçlü ve tahmin edilmesi
              zor bir şifre kullanın.
            </p>

            <form
              action="/api/agent/settings/password"
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
                    minLength={8}
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
                    minLength={8}
                    className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                  />
                </label>
              </div>

              <AppButton type="submit" size="lg" className="justify-self-start">
                Şifreyi Güncelle
              </AppButton>
            </form>
          </section>
        </div>

        <aside className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold">Hesap Özeti</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-[#68746e]">Temsilci</dt>
              <dd className="mt-1 text-lg font-bold">{agent.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#68746e]">Kullanıcı Adı</dt>
              <dd className="mt-1 font-mono">@{agent.username}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#68746e]">Toplam İşlem</dt>
              <dd className="mt-1 font-bold">
                {formatNumber(agent._count.payments)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#68746e]">Toplam Tutar</dt>
              <dd className="mt-1 font-bold">
                {formatCurrency(paymentStats._sum.amount ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#68746e]">Oluşturma</dt>
              <dd className="mt-1">{formatDateTime(agent.createdAt)}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
