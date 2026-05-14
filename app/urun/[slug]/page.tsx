import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
    },
  });

  if (!product) {
    return notFound();
  }

  return (
    <main className="max-w-6xl mx-auto p-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <img
            src={product.imageUrl || "https://via.placeholder.com/800x600"}
            className="rounded-2xl w-full"
          />
        </div>

        <div>
          <h1 className="text-5xl font-bold mb-4">{product.name}</h1>

          <p className="text-zinc-400 text-xl mb-8">{product.brand}</p>

          <div className="space-y-4">
            <div>
              <strong>Stok Kodu:</strong> {product.stockCode}
            </div>

            <div>
              <strong>Kategori:</strong> {product.category}
            </div>

            <div>
              <strong>Alt Kategori:</strong> {product.subCategory}
            </div>

            <div>
              <strong>Stok Durumu:</strong> {product.stockStatus}
            </div>

            <div>
              <strong>Birim:</strong> {product.unit}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Açıklama</h2>

            <p className="text-zinc-300 leading-8">{product.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
