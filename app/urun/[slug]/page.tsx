import { prisma } from "@/lib/prisma";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: {
      slug,
    },
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return <div>Ürün bulunamadı.</div>;
  }

  let features = {};

  try {
    features = JSON.parse(product.features || "{}");
  } catch {}

  return (
    <main className="p-10">
      <div className="grid grid-cols-2 gap-10">
        <div>
          <img
            src={product.imageUrl || ""}
            alt={product.name}
            className="rounded-xl"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <p className="text-gray-400 mb-4">{product.brand}</p>

          <p className="mb-6">{product.description}</p>

          <div className="space-y-2 mb-8">
            {Object.entries(features).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <strong>{key}:</strong>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
