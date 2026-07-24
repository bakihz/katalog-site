import type { PaymentProviderAuditLog } from "./types";

type ProviderAuditLogProps = {
  auditLogs: PaymentProviderAuditLog[];
};

const actionLabels: Record<string, string> = {
  "payment_provider.create": "Sanal POS eklendi",
  "payment_provider.update": "Sanal POS güncellendi",
  "payment_provider.activate": "Sanal POS aktif edildi",
  "payment_provider.delete": "Sanal POS silindi",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAuditDetails(details: string | null) {
  if (!details) {
    return "Detay yok";
  }

  try {
    const parsed = JSON.parse(details) as {
      changedFields?: string[];
      sensitiveFieldsChanged?: Record<string, boolean>;
      createdFields?: Record<string, boolean>;
    };
    const parts: string[] = [];

    if (parsed.changedFields?.length) {
      parts.push(`Değişen alanlar: ${parsed.changedFields.join(", ")}`);
    }

    const sensitiveChanges = Object.entries(
      parsed.sensitiveFieldsChanged ?? {},
    )
      .filter(([, changed]) => changed)
      .map(([field]) => field);

    if (sensitiveChanges.length) {
      parts.push(`Hassas alan güncellendi: ${sensitiveChanges.join(", ")}`);
    }

    const filledFields = Object.entries(parsed.createdFields ?? {})
      .filter(([, filled]) => filled)
      .map(([field]) => field);

    if (filledFields.length) {
      parts.push(`Dolu oluşturulan alanlar: ${filledFields.join(", ")}`);
    }

    return parts.length ? parts.join(" · ") : "Detay yok";
  } catch {
    return "Detay okunamadı";
  }
}

export function ProviderAuditLog({ auditLogs }: ProviderAuditLogProps) {
  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">Son POS İşlem Kayıtları</h3>
          <p className="mt-1 text-sm text-[#68746e]">
            POS ekleme, güncelleme, aktif etme ve silme işlemlerinin son
            kayıtları.
          </p>
        </div>
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          Hassas değerler kaydedilmez
        </span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#17201c]/20 bg-[#fcfbf8] p-8 text-sm text-[#68746e]">
          Henüz POS işlem kaydı bulunmuyor.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-[#17201c]/10 text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-[#89938e]">
                <th className="px-3 py-3">Tarih</th>
                <th className="px-3 py-3">İşlem</th>
                <th className="px-3 py-3">POS</th>
                <th className="px-3 py-3">Admin</th>
                <th className="px-3 py-3">IP</th>
                <th className="px-3 py-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17201c]/10">
              {auditLogs.map((log) => (
                <tr key={log.id} className="align-top">
                  <td className="whitespace-nowrap px-3 py-4 text-[#68746e]">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-3 py-4 font-semibold text-[#17201c]">
                    {actionLabels[log.action] ?? log.action}
                  </td>
                  <td className="px-3 py-4 text-[#17201c]">
                    {log.entityName ?? `#${log.entityId ?? log.id}`}
                  </td>
                  <td className="px-3 py-4 text-[#68746e]">
                    {log.actor
                      ? `${log.actor.name} (${log.actor.username})`
                      : "Bilinmiyor"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[#68746e]">
                    {log.ipAddress ?? "-"}
                  </td>
                  <td className="min-w-64 px-3 py-4 text-[#68746e]">
                    {formatAuditDetails(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
