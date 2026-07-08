import Image from "next/image";
import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const isRateLimited = params.error === "rate";
  const passwordChanged = params.success === "password";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#10231d] px-6 py-10 text-white">
      <div className="absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-[#315d4f] blur-3xl" />
      <div className="absolute -bottom-32 right-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[#c2853e]/35 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-semibold text-white/65 transition hover:text-white"
        >
          ← Ana sayfaya dön
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="relative size-14 overflow-hidden rounded-2xl bg-white p-2">
            <Image
              src="/logo.svg"
              alt="Lale EDT logo"
              fill
              priority
              sizes="56px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Lale EDT
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Admin Girişi</h1>
          </div>
        </div>

        {(hasError || isRateLimited) && (
          <p className="mb-5 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100">
            {isRateLimited
              ? "Çok fazla hatalı giriş yapıldı. Lütfen 15 dakika sonra tekrar deneyin."
              : "Kullanıcı adı veya şifre hatalı."}
          </p>
        )}

        {passwordChanged && (
          <p className="mb-5 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-100">
            Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
          </p>
        )}

        <form action="/api/admin/login" method="POST" className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-white/70"
            >
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              name="username"
              required
              autoComplete="username"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/40 focus:bg-white/15"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-white/70"
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/40 focus:bg-white/15"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#10231d] transition hover:bg-[#f5f3ee]"
          >
            Giriş Yap
          </button>
        </form>
      </section>
    </main>
  );
}
