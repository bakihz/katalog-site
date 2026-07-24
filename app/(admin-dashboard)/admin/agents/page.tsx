import { formatNumber } from "@/lib/format";
import { getUserRole, getUserRoleLabel, userRoleOptions } from "@/lib/userRole";
import { prisma } from "@/lib/prisma";
import { AppButton, PageHeader, StatCard } from "@/components/ui";
import Link from "next/link";
import { getFirstSearchParam } from "@/lib/searchParams";

type AdminAgentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const successMessages: Record<string, string> = {
  created: "Temsilci eklendi.",
  updated: "Temsilci bilgileri güncellendi.",
  password: "Temsilci şifresi güncellendi.",
  deleted: "Temsilci silindi.",
  status: "Temsilci durumu güncellendi.",
};

const errorMessages: Record<string, string> = {
  create: "Temsilci eklenemedi. Ad, kullanıcı adı ve en az 8 karakter şifre zorunlu.",
  update: "Temsilci bilgileri güncellenemedi.",
  password: "Şifre güncellenemedi. En az 8 karakter kullanın.",
  duplicate: "Bu kullanıcı adı zaten kullanılıyor.",
  "has-payments":
    "Ödeme kaydı olan temsilci silinemez. Geçmiş raporları korumak için pasife alın.",
  confirm: "Silmek için temsilcinin kullanıcı adını doğru yazmanız gerekir.",
  "not-found": "Temsilci bulunamadı.",
};

export default async function AdminAgentsPage({
  searchParams,
}: AdminAgentsPageProps) {
  const params = await searchParams;
  const success = getFirstSearchParam(params.success);
  const error = getFirstSearchParam(params.error);

  const agents = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { payments: true } } },
  });

  const activeAgents = agents.filter((agent) => agent.isActive).length;
  const passiveAgents = agents.length - activeAgents;
  const financeAgents = agents.filter(
    (agent) => getUserRole(agent) === "finance",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kullanıcı Yönetimi"
        title="Temsilciler"
        description="Temsilci hesaplarını ekle, bilgilerini güncelle, şifre belirle, pasife al veya güvenli şekilde sil."
        aside={
          <div className="grid grid-cols-4 gap-3 sm:min-w-[34rem]">
            <StatCard
              label="Toplam"
              value={formatNumber(agents.length)}
              className="bg-[#f5f3ee] p-4 shadow-none"
            />
            <StatCard
              label="Aktif"
              value={formatNumber(activeAgents)}
              className="bg-emerald-50 p-4 text-emerald-800 shadow-none"
            />
            <StatCard
              label="Pasif"
              value={formatNumber(passiveAgents)}
              className="bg-red-50 p-4 text-red-800 shadow-none"
            />
            <StatCard
              label="Finans"
              value={formatNumber(financeAgents)}
              className="bg-blue-50 p-4 text-blue-800 shadow-none"
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

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Yeni Temsilci Ekle</h3>
        <p className="mt-1 text-sm text-[#68746e]">
          Şifre en az 8 karakter olmalı. Temsilci bu bilgilerle kendi paneline
          giriş yapar.
        </p>

        <form
          action="/api/admin/agents"
          method="POST"
          className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_180px_auto]"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Ad Soyad"
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          />
          <input
            type="text"
            name="username"
            required
            placeholder="Kullanıcı adı"
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Geçici şifre"
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          />
          <select
            name="role"
            defaultValue="agent"
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          >
            {userRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <AppButton type="submit" size="lg">
            Ekle
          </AppButton>
        </form>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#17201c]/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="bg-[#f8f6f1]">
              <tr className="text-xs uppercase tracking-[0.14em] text-[#89938e]">
                <th className="px-6 py-4">Temsilci</th>
                <th className="px-6 py-4">Yetki</th>
                <th className="px-6 py-4">İşlem</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Bilgi Güncelle</th>
                <th className="px-6 py-4">Şifre Belirle</th>
                <th className="px-6 py-4">Silme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17201c]/8">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-sm text-[#68746e]">
                    Henüz temsilci bulunmuyor.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const paymentCount = agent._count.payments;
                  const canDelete = paymentCount === 0;

                  return (
                    <tr key={agent.id} className="align-top">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{agent.name}</p>
                        <p className="mt-1 text-sm text-[#68746e]">
                          @{agent.username}
                        </p>
                        <p className="mt-1 text-xs text-[#89938e]">
                          Oluşturma:{" "}
                          {agent.createdAt.toLocaleDateString("tr-TR")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            getUserRole(agent) === "finance"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-[#edf1ec] text-[#173f32]"
                          }`}
                        >
                          {getUserRoleLabel(agent)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/payments?agentId=${agent.id}`}
                          className="font-semibold text-[#173f32] underline decoration-[#173f32]/25 underline-offset-4 hover:text-[#c2853e]"
                        >
                          {formatNumber(paymentCount)} işlem
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            agent.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {agent.isActive ? "Aktif" : "Pasif"}
                        </span>
                        <form
                          action={`/api/admin/agents/${agent.id}/toggle`}
                          method="POST"
                          className="mt-3"
                        >
                          <AppButton
                            type="submit"
                            variant="outline"
                            size="sm"
                          >
                            {agent.isActive ? "Pasife Al" : "Aktif Et"}
                          </AppButton>
                        </form>
                      </td>
                      <td className="px-6 py-4">
                        <form
                          action={`/api/admin/agents/${agent.id}/update`}
                          method="POST"
                          className="grid min-w-56 gap-2"
                        >
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={agent.name}
                            className="rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                          />
                          <input
                            type="text"
                            name="username"
                            required
                            defaultValue={agent.username}
                            className="rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                          />
                          <select
                            name="role"
                            defaultValue={getUserRole(agent)}
                            className="rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                          >
                            {userRoleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <AppButton type="submit" size="sm">
                            Kaydet
                          </AppButton>
                        </form>
                      </td>
                      <td className="px-6 py-4">
                        <form
                          action={`/api/admin/agents/${agent.id}/password`}
                          method="POST"
                          className="grid min-w-48 gap-2"
                        >
                          <input
                            type="password"
                            name="password"
                            required
                            minLength={8}
                            placeholder="Yeni şifre"
                            className="rounded-xl border border-[#17201c]/10 bg-[#f8f6f1] px-3 py-2 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
                          />
                          <AppButton type="submit" size="sm">
                            Şifreyi Güncelle
                          </AppButton>
                        </form>
                      </td>
                      <td className="px-6 py-4">
                        {canDelete ? (
                          <form
                            action={`/api/admin/agents/${agent.id}/delete`}
                            method="POST"
                            className="grid min-w-52 gap-2"
                          >
                            <p className="text-xs leading-5 text-[#68746e]">
                              Silmek için kullanıcı adını yaz:
                              <span className="font-bold">
                                {" "}
                                {agent.username}
                              </span>
                            </p>
                            <input
                              type="text"
                              name="confirmUsername"
                              required
                              placeholder={agent.username}
                              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:bg-white"
                            />
                            <button
                              type="submit"
                              className="inline-flex justify-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                            >
                              Temsilciyi Sil
                            </button>
                          </form>
                        ) : (
                          <div className="max-w-52 rounded-2xl bg-[#f8f6f1] p-3 text-xs leading-5 text-[#68746e]">
                            Ödeme kaydı olduğu için silinemez. Gerekirse
                            pasife alın.
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
