import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.laleedt.com.tr/gecici",
  },
};

const contactDetails = [
  {
    label: "Telefon",
    links: [
      { value: "0 (544) 303 33 66", href: "tel:+905443033366" },
      { value: "0 (324) 234 10 17", href: "tel:+903242341017" },
    ],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.1 3.5 9 8.2 6.7 9.7a15 15 0 0 0 7.6 7.6l1.5-2.3 4.7 1.9-.8 3.6c-.2.9-1 1.5-1.9 1.5A15.8 15.8 0 0 1 2 6.2c0-.9.6-1.7 1.5-1.9l3.6-.8Z" />
      </svg>
    ),
  },
  {
    label: "E-posta",
    links: [
      {
        value: "info@laleedt.com.tr",
        href: "mailto:info@laleedt.com.tr",
      },
    ],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5h18v14H3V5Zm2 2v.5l7 4.8 7-4.8V7H5Zm14 10V9.9l-7 4.8-7-4.8V17h14Z" />
      </svg>
    ),
  },
  {
    label: "Adres",
    links: [
      {
        value: "Yalınayak, 102055 Sok No:2-10, 33240 Toroslar/Mersin",
        href: "https://www.google.com/maps/search/?api=1&query=Lale%20EDT%20G%C4%B1da%2C%20Yal%C4%B1nayak%2C%20102055%20Sok%20No%3A2-10%2C%2033240%20Toroslar%2FMersin",
        external: true,
      },
    ],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a8 8 0 0 1 8 8c0 5.4-8 12-8 12S4 15.4 4 10a8 8 0 0 1 8-8Zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
      </svg>
    ),
  },
];

export default async function TemporaryPage() {
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );
  const agent = agentId
    ? await prisma.user.findUnique({
        where: { id: agentId },
        select: { isActive: true, name: true },
      })
    : null;
  const isAgentLoggedIn = Boolean(agent?.isActive);
  const agentLoginHref = isAgentLoggedIn ? "/panel" : "/giris";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#17201c] lg:h-screen lg:overflow-hidden">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />
      <div className="absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-[#d7e3d8] blur-3xl" />
      <div className="absolute -bottom-32 right-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[#e8d7b9] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-10 lg:h-screen lg:min-h-0 lg:px-16 lg:py-6">
        <header className="flex items-center justify-between border-b border-[#17201c]/10 pb-5 lg:pb-4">
          <div className="flex items-center gap-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl shadow-lg shadow-[#173f32]/15 lg:size-16">
              <Image
                src="/logo.svg"
                alt="Lale EDT logo"
                fill
                priority
                sizes="64px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">
                Lale EDT Gıda A.Ş.
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#63736b]">
                Ürün ve hizmet kataloğu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={agentLoginHref}
              className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#173f32]/15 transition hover:bg-[#10231d]"
            >
              {isAgentLoggedIn ? (
                <>
                  <span className="hidden max-w-36 truncate normal-case tracking-normal sm:inline">
                    {agent?.name}
                  </span>
                  <span className="hidden opacity-60 sm:inline">•</span>
                  <span>Panele Git</span>
                </>
              ) : (
                "Temsilci Girişi"
              )}
            </Link>
            <span className="hidden rounded-full border border-[#173f32]/15 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#476057] backdrop-blur sm:inline-flex">
              Çok yakında
            </span>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:min-h-0 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-6 xl:py-8">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#173f32]/8 px-4 py-2 text-sm font-semibold text-[#173f32] lg:mb-5">
              <span className="size-2 rounded-full bg-[#c2853e]" />
              Web sitemiz yenileniyor
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-[4rem] xl:text-7xl">
              Size daha iyi hizmet verebilmek için hazırlanıyoruz.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5d6963] lg:mt-5">
              Yeni ürün kataloğumuz ve dijital hizmetlerimiz çok yakında
              yayında. Bu süreçte bilgi ve talepleriniz için bizimle doğrudan
              iletişime geçebilirsiniz.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-white/70 bg-white/70 p-7 shadow-[0_30px_80px_-40px_rgba(23,63,50,0.45)] backdrop-blur-xl sm:p-9 lg:p-7">
            <div className="mb-8 lg:mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c2853e]">
                İletişim
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Bize ulaşın
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#68746e]">
                Çalışma saatleri içerisinde sorularınızı memnuniyetle
                yanıtlarız.
              </p>
            </div>

            <div className="space-y-3 lg:space-y-2">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center gap-4 rounded-2xl border border-[#17201c]/8 p-4 transition hover:border-[#173f32]/25 hover:bg-white lg:p-3"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf1ec] text-[#173f32]">
                    <span className="size-5 fill-current">{detail.icon}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#89938e]">
                      {detail.label}
                    </span>
                    <span className="mt-1 flex flex-col items-start gap-1">
                      {detail.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target={
                            "external" in link && link.external
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            "external" in link && link.external
                              ? "noreferrer"
                              : undefined
                          }
                          className="group inline-flex max-w-full items-center gap-1.5 py-1 text-sm font-medium text-[#26342e]  transition hover:text-[#c2853e] hover:decoration-[#c2853e]"
                        >
                          <span>{link.value}</span>
                          <span
                            aria-hidden="true"
                            className="text-[#89938e] transition group-hover:translate-x-0.5 group-hover:text-[#c2853e]"
                          >
                            ↗
                          </span>
                        </a>
                      ))}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-[#17201c]/10 pt-6 text-sm text-[#68746e] lg:mt-5 lg:pt-4">
              Pazartesi – Cumartesi
              <span className="float-right font-semibold text-[#26342e]">
                08.00 – 18.00
              </span>
            </div>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-[#17201c]/10 pt-6 text-xs text-[#718078] sm:flex-row sm:items-center sm:justify-between lg:pt-4">
          <p>© 2026 Lale EDT Gıda A.Ş. Tüm hakları saklıdır.</p>
          <p>Yeni web sitemiz için geri sayım başladı.</p>
        </footer>
      </div>
    </main>
  );
}
