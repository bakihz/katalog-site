import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";

const navLinks = [
  { href: "/panel", label: "Dashboard" },
  { href: "/panel/odeme", label: "Ödeme Al" },
  { href: "/panel/islemler", label: "İşlemlerim" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );
  const agent = agentId
    ? await prisma.user.findUnique({
        where: { id: agentId },
        select: { name: true },
      })
    : null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-blue-950 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-blue-800">
          <span className="text-lg font-bold tracking-wide">
            Temsilci Paneli
          </span>
          {agent && (
            <p className="text-sm text-blue-300 mt-1 truncate">{agent.name}</p>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-blue-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-blue-300 hover:bg-blue-800 hover:text-white transition-colors"
          >
            ← Ana Sayfa
          </Link>
          <form action="/api/agent/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors"
            >
              ⏻ Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 overflow-auto">
        {children}
      </main>
    </div>
  );
}
