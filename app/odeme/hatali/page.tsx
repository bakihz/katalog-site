export default async function HataliPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const errMsg = params.err;
  const mdStatus = params.md;

  return (
    <main className="max-w-xl mx-auto p-10 text-center">
      <div className="text-red-500 text-7xl mb-4">✗</div>
      <h1 className="text-3xl font-bold mb-2">Ödeme Başarısız</h1>
      <p className="text-gray-400 mt-2">
        Ödeme işleminiz tamamlanamadı. Lütfen bilgilerinizi kontrol edip tekrar
        deneyin.
      </p>

      {(errMsg || mdStatus) && (
        <div className="mt-6 border border-red-800 rounded-xl p-4 text-left text-sm space-y-1">
          {errMsg && (
            <p>
              <span className="text-gray-400">Hata: </span>
              <span className="text-red-400">{errMsg}</span>
            </p>
          )}
          {mdStatus && (
            <p>
              <span className="text-gray-400">mdStatus: </span>
              <span className="font-mono">{mdStatus}</span>
            </p>
          )}
        </div>
      )}

      <a
        href="/odeme"
        className="mt-8 inline-block bg-white text-black px-6 py-3 rounded-xl font-bold"
      >
        Tekrar Dene
      </a>
    </main>
  );
}
