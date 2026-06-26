import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminAgentsPage() {
  const agents = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { payments: true } } },
  });

  const activeAgents = agents.filter((agent) => agent.isActive).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2853e]">
              Kullanıcı Yönetimi
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Temsilciler
            </h2>
            <p className="mt-2 text-sm text-[#68746e]">
              Temsilci hesaplarını ekle, aktif/pasif durumlarını yönet.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl bg-[#f5f3ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a867f]">
                Toplam
              </p>
              <p className="mt-1 text-2xl font-bold">{agents.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Aktif
              </p>
              <p className="mt-1 text-2xl font-bold">{activeAgents}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Yeni Temsilci Ekle</h3>
        <p className="mt-1 text-sm text-[#68746e]">
          Temsilci bu bilgilerle kendi paneline giriş yapar.
        </p>

        <form
          action="/api/admin/agents"
          method="POST"
          className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
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
            placeholder="Şifre"
            className="rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#10231d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173f32]"
          >
            Ekle
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#17201c]/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-[#f8f6f1]">
              <tr className="text-xs uppercase tracking-[0.14em] text-[#89938e]">
                <th className="px-6 py-4">Ad Soyad</th>
                <th className="px-6 py-4">Kullanıcı Adı</th>
                <th className="px-6 py-4">İşlem</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17201c]/8">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-sm text-[#68746e]">
                    Henüz temsilci bulunmuyor.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 font-semibold">{agent.name}</td>
                    <td className="px-6 py-4 text-sm text-[#68746e]">
                      {agent.username}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/payments?agentId=${agent.id}`}
                        className="font-semibold text-[#173f32] underline decoration-[#173f32]/25 underline-offset-4 hover:text-[#c2853e]"
                      >
                        {agent._count.payments} işlem
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          agent.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {agent.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form
                        action={`/api/admin/agents/${agent.id}/toggle`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="rounded-full border border-[#17201c]/10 px-4 py-2 text-xs font-bold transition hover:border-[#173f32]/30 hover:bg-[#f5f3ee]"
                        >
                          {agent.isActive ? "Pasife Al" : "Aktif Et"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
