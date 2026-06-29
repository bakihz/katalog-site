import Image from "next/image";
import Link from "next/link";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1ea] px-4 py-8 text-[#17201c] sm:px-6">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />
      <div className="absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-[#d7e3d8] blur-3xl" />
      <div className="absolute -bottom-32 right-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[#e8d7b9] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_30px_90px_-45px_rgba(23,63,50,0.55)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[#10231d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="relative size-20 overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20">
                <Image
                  src="/logo.svg"
                  alt="Lale EDT logo"
                  fill
                  priority
                  sizes="80px"
                  className="object-contain"
                />
              </div>

              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.26em] text-[#c2853e]">
                Temsilci Paneli
              </p>
              <h1 className="mt-3 max-w-md text-4xl font-semibold tracking-[-0.04em]">
                Sahadaki tahsilat işlemleri için güvenli giriş.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
                Size tanımlanan kullanıcı bilgileriyle giriş yaparak ödeme
                alabilir, kendi işlemlerinizi ve dekontlarınızı
                görüntüleyebilirsiniz.
              </p>
            </div>

            {/* <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              <p className="font-semibold text-white">Yetki sınırı</p>
              <p className="mt-2 leading-6">
                Bu alan sadece temsilcilere özeldir. Admin paneli ve genel
                sistem ayarlarına erişim verilmez.
              </p>
            </div> */}
          </section>

          <section className="p-6 sm:p-8 lg:p-12">
            <div className="mb-8 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#5d6963] transition hover:text-[#173f32]"
              >
                <span aria-hidden="true">←</span>
                Ana Sayfaya Dön
              </Link>

              <div className="relative size-12 overflow-hidden rounded-xl shadow-lg shadow-[#173f32]/15 lg:hidden">
                <Image
                  src="/logo.svg"
                  alt="Lale EDT logo"
                  fill
                  priority
                  sizes="48px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c2853e]">
                Lale EDT
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Temsilci Girişi
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#68746e]">
                Pazarlamacı hesabınızla giriş yapın. Giriş sonrası yalnızca
                size ait ödeme ve işlem kayıtlarını görebilirsiniz.
              </p>
            </div>

            {hasError && (
              <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                Kullanıcı adı veya şifre hatalı.
              </p>
            )}

            <form action="/api/agent/login" method="POST" className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Kullanıcı Adı
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="username"
                  className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Şifre
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#10231d] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#10231d]/20 transition hover:bg-[#173f32]"
              >
                Giriş Yap
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
