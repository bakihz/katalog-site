import { prisma } from "@/lib/prisma";

async function getProviders() {
  return prisma.paymentProvider.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Sanal POS Yönetimi</h1>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="border p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <h2 className="font-bold text-xl">{provider.name}</h2>

              <p>Durum: {provider.isActive ? "Aktif" : "Pasif"}</p>
            </div>

            <form
              action={`/api/providers/${provider.id}/activate`}
              method="POST"
            >
              <button className="bg-white text-black px-4 py-2 rounded-lg">
                Aktif Yap
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
