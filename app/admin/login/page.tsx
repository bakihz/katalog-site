export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-sm bg-neutral-900 rounded-2xl p-8 shadow-xl">
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6">Admin Girişi</h1>

        {hasError && (
          <p className="text-red-400 text-sm mb-4">
            Kullanıcı adı veya şifre hatalı.
          </p>
        )}

        <form action="/api/admin/login" method="POST" className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-1">Şifre</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </main>
  );
}
