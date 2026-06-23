import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";

const PAGE_SIZE = 20;

export default async function HomeOriginal({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );
  const odemeUrl = agentId ? "/panel/odeme" : "/giris";

  const q = params.q || "";

  const page = Number(params.page || 1);

  const skip = (page - 1) * PAGE_SIZE;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            {
              name: {
                contains: q,
              },
            },

            {
              stockCode: {
                contains: q,
              },
            },

            {
              brand: {
                contains: q,
              },
            },
          ],
        }
      : undefined,

    take: PAGE_SIZE,

    skip,

    orderBy: {
      id: "desc",
    },
  });

  const total = await prisma.product.count({
    where: q
      ? {
          OR: [
            {
              name: {
                contains: q,
              },
            },

            {
              stockCode: {
                contains: q,
              },
            },

            {
              brand: {
                contains: q,
              },
            },
          ],
        }
      : undefined,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="p-8">
      <h1 className="text-5xl font-bold mb-8">Ürünler</h1>

      <Link
        href={odemeUrl}
        className="inline-block bg-white text-black px-6 py-3 rounded-xl font-bold mb-8"
      >
        Ödeme Yap
      </Link>

      <Link
        href="/giris"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold mb-8 ml-4 hover:bg-blue-500 transition-colors"
      >
        Temsilci Girişi
      </Link>

      <Link
        href="/admin"
        className="inline-block bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold mb-8 ml-4 border border-neutral-600 hover:bg-neutral-700 transition-colors"
      >
        Yönetim Paneli
      </Link>

      <form className="mb-8">
        <input
          type="text"
          name="q"
          placeholder="Ürün ara..."
          defaultValue={q}
          className="w-full max-w-xl border p-4 rounded-xl bg-black"
        />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/urun/${product.slug}`}
            className="border rounded-2xl p-4"
          >
            <img
              src={
                product.imageUrl && product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : "https://via.placeholder.com/800x600"
              }
              className="rounded-xl mb-4 w-full"
            />

            <h2 className="text-2xl font-bold">{product.name}</h2>

            <p className="text-zinc-400">{product.brand}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-2 mt-10">
        {Array.from({
          length: totalPages,
        }).map((_, i) => (
          <Link
            key={i}
            href={`/?page=${i + 1}`}
            className={`px-4 py-2 rounded-lg border ${
              page === i + 1 ? "bg-white text-black" : ""
            }`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </main>
  );
}
