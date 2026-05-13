import Link from "next/link";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Ürünler</h1>
      <Link
        href="/odeme"
        className="inline-block bg-white text-black px-6 py-3 rounded-xl font-bold mb-8"
      >
        Ödeme Yap
      </Link>

      <div className="grid grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="border rounded-xl p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="rounded-lg mb-4"
            />

            <h2 className="font-bold text-lg">{product.name}</h2>

            <p className="text-gray-500">{product.brand}</p>

            <Link href={`/urun/${product.slug}`} key={product.id}>
              <div className="border rounded-xl p-4"></div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
