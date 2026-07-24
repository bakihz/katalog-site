import { PageHeader } from "@/components/ui";
import { ProviderActivation } from "@/components/admin/payment-providers/provider-activation";
import { ProviderAuditLog } from "@/components/admin/payment-providers/provider-audit-log";
import { ProviderCreate } from "@/components/admin/payment-providers/provider-create";
import { ProviderEditor } from "@/components/admin/payment-providers/provider-editor";
import { ProviderOverview } from "@/components/admin/payment-providers/provider-overview";
import { ensureAllPaymentProviders } from "@/lib/paymentProviders";
import { prisma } from "@/lib/prisma";
import { getFirstSearchParam } from "@/lib/searchParams";

type ProvidersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const successMessages: Record<string, string> = {
  created: "Sanal POS eklendi.",
  updated: "Sanal POS bilgileri güncellendi.",
  deleted: "Sanal POS silindi.",
};

const errorMessages: Record<string, string> = {
  "create-name": "POS adı zorunludur.",
  "create-duplicate": "Bu isimde bir sanal POS zaten mevcut.",
  "create-gateway":
    "Gateway URL http veya https ile başlayan geçerli bir adres olmalıdır.",
  "update-name": "POS adı zorunludur.",
  "update-duplicate": "Bu isimde başka bir sanal POS zaten mevcut.",
  "update-gateway":
    "Gateway URL http veya https ile başlayan geçerli bir adres olmalıdır.",
  "update-active-incomplete":
    "Aktif sanal POS'un zorunlu bilgileri boş bırakılamaz.",
  "update-notfound": "Sanal POS bulunamadı.",
  "activate-notfound": "Seçilen sanal POS bulunamadı.",
  "activate-incomplete":
    "Bu sanal POS aktif edilemez; önce POS adı, Client ID, Store Key ve Gateway URL alanlarını tamamlayın.",
  "delete-active":
    "Aktif sanal POS silinemez. Önce farklı bir POS'u aktif edin.",
  "delete-notfound": "Sanal POS bulunamadı.",
};

async function getProvidersPageData() {
  await ensureAllPaymentProviders();

  return Promise.all([
    prisma.paymentProvider.findMany({ orderBy: { id: "asc" } }),
    prisma.adminAuditLog.findMany({
      where: { entityType: "payment_provider" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    }),
  ]);
}

export default async function ProvidersPage({
  searchParams,
}: ProvidersPageProps) {
  const params = await searchParams;
  const success = getFirstSearchParam(params.success);
  const error = getFirstSearchParam(params.error);
  const [providers, auditLogs] = await getProvidersPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ödeme Altyapısı"
        title="Sanal POS Yönetimi"
        description="Sanal POS sağlayıcılarını ekle, düzenle ve aktif olanı seç."
      />

      {(success || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error
            ? (errorMessages[error] ?? "İşlem sırasında hata oluştu.")
            : (successMessages[success ?? ""] ?? "İşlem başarılı.")}
        </div>
      )}

      <ProviderOverview providers={providers} />
      <ProviderActivation providers={providers} />

      {providers.map((provider) => (
        <ProviderEditor key={provider.id} provider={provider} />
      ))}

      <ProviderCreate />
      <ProviderAuditLog auditLogs={auditLogs} />
    </div>
  );
}
