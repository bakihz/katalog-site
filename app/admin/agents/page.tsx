import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminAgentsPage() {
  const agents = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { payments: true } } },
  });

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold">Temsilci Yönetimi</h1>

      {/* Yeni temsilci formu */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Yeni Temsilci Ekle</h2>
        <form
          action="/api/admin/agents"
          method="POST"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Ad Soyad"
            className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <input
            type="text"
            name="username"
            required
            placeholder="Kullanıcı Adı"
            className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Şifre"
            className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <button
            type="submit"
            className="bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-80 transition-opacity"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Temsilci listesi */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {agents.length === 0 ? (
          <p className="p-6 text-neutral-400 text-sm">
            Henüz temsilci bulunmuyor.
          </p>
        ) : (
          <table className="w-full">
            <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Ad Soyad
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Kullanıcı Adı
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  İşlem Sayısı
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-500">
                  Durum
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b last:border-0 border-neutral-100 dark:border-neutral-800"
                >
                  <td className="px-6 py-3 font-medium">{agent.name}</td>
                  <td className="px-6 py-3 text-sm text-neutral-500">
                    {agent.username}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <Link
                      href={`/admin/payments?agentId=${agent.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {agent._count.payments} işlem
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        agent.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {agent.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <form
                      action={`/api/admin/agents/${agent.id}/toggle`}
                      method="POST"
                    >
                      <button
                        type="submit"
                        className="text-xs border border-neutral-300 dark:border-neutral-600 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {agent.isActive ? "Pasife Al" : "Aktif Et"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
