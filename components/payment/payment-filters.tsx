import { AppButton } from "@/components/ui";
import {
  adminPaymentPageSizeOptions,
  type AdminPaymentFilters,
} from "@/lib/adminPaymentFilters";
import { formatNumber } from "@/lib/format";

type PaymentFilterAgent = {
  id: number;
  name: string;
  username: string;
};

type PaymentFiltersProps = {
  filters: AdminPaymentFilters;
  clearHref: string;
  title: string;
  description: string;
  totalCount: number;
  visibleCount: number;
  agents?: PaymentFilterAgent[];
  exportHref?: string;
};

const statusOptions = [
  { value: "", label: "Tüm Durumlar" },
  { value: "Paid", label: "Başarılı" },
  { value: "Failed", label: "Başarısız" },
  { value: "Pending", label: "Bekliyor" },
  { value: "Expired", label: "Süresi Doldu" },
  { value: "Cancelled", label: "İptal Edildi" },
];

const fieldClassName =
  "w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-sm outline-none transition focus:border-[#173f32]/40 focus:bg-white";

const selectClassName = `${fieldClassName} font-semibold`;

function FilterLabel({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7a867f]">
      {children}
    </span>
  );
}

export function PaymentFilters({
  filters,
  clearHref,
  title,
  description,
  totalCount,
  visibleCount,
  agents,
  exportHref,
}: PaymentFiltersProps) {
  const showAgentFilter = Boolean(agents);

  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-[#17201c]">{title}</h2>
        <p className="mt-1 text-sm text-[#68746e]">{description}</p>
      </div>

      <form className="mt-5 space-y-4">
        <div
          className={`grid gap-3 md:grid-cols-2 ${
            showAgentFilter
              ? "xl:grid-cols-[minmax(0,1.5fr)_minmax(11rem,0.65fr)_minmax(14rem,1fr)]"
              : "xl:grid-cols-[minmax(0,1.5fr)_minmax(11rem,0.65fr)]"
          }`}
        >
          <label>
            <FilterLabel>Ara</FilterLabel>
            <input
              type="search"
              name="q"
              defaultValue={filters.query}
              placeholder="Firma/cari, kart sahibi, açıklama veya sipariş no"
              className={fieldClassName}
            />
          </label>

          <label>
            <FilterLabel>Durum</FilterLabel>
            <select
              name="status"
              defaultValue={filters.status}
              className={selectClassName}
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {agents && (
            <label>
              <FilterLabel>Temsilci</FilterLabel>
              <select
                name="agentId"
                defaultValue={filters.selectedAgentId || ""}
                className={selectClassName}
              >
                <option value="">Tüm Temsilciler</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} (@{agent.username})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="grid gap-3 border-t border-[#17201c]/8 pt-4 sm:grid-cols-2 xl:grid-cols-[170px_170px_150px_minmax(1rem,1fr)_auto_auto]">
          <label>
            <FilterLabel>Başlangıç</FilterLabel>
            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className={selectClassName}
            />
          </label>

          <label>
            <FilterLabel>Bitiş</FilterLabel>
            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className={selectClassName}
            />
          </label>

          <label>
            <FilterLabel>Sayfa</FilterLabel>
            <select
              name="pageSize"
              defaultValue={filters.pageSize}
              className={selectClassName}
            >
              {adminPaymentPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} kayıt
                </option>
              ))}
            </select>
          </label>

          <div className="hidden xl:block" aria-hidden="true" />

          <div className="flex items-end">
            <AppButton type="submit" size="lg" className="w-full">
              Filtrele
            </AppButton>
          </div>

          <div className="flex items-end">
            <AppButton
              href={clearHref}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Temizle
            </AppButton>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-2 border-t border-[#17201c]/8 pt-4 text-sm text-[#68746e] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {formatNumber(totalCount)} kayıt içinden bu sayfada{" "}
          {formatNumber(visibleCount)} kayıt gösteriliyor.
        </p>
        {exportHref && (
          <AppButton href={exportHref} variant="secondary" size="sm">
            CSV İndir
          </AppButton>
        )}
      </div>
    </section>
  );
}
