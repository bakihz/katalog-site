import { AppButton } from "@/components/ui";
import {
  getProviderMissingFields,
  isProviderReady,
} from "@/lib/paymentProviderAdmin";
import { ProviderFormFields } from "./provider-form-fields";
import {
  getProviderStatusClassName,
  getProviderStatusLabel,
} from "./provider-ui";
import type { PaymentProviderRecord } from "./types";

type ProviderEditorProps = {
  provider: PaymentProviderRecord;
};

export function ProviderEditor({ provider }: ProviderEditorProps) {
  const ready = isProviderReady(provider);
  const missingFields = getProviderMissingFields(provider);
  const editFormId = `provider-edit-${provider.id}`;

  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">{provider.name}</h3>
          <p className="text-sm text-[#68746e]">
            {provider.merchantId
              ? `Client ID: ${provider.merchantId}`
              : "Client ID girilmemiş"}
          </p>
          {!ready && (
            <p className="mt-1 text-sm font-semibold text-amber-700">
              Eksik alanlar: {missingFields.join(", ")}
            </p>
          )}
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getProviderStatusClassName(
            { isActive: provider.isActive, ready },
          )}`}
        >
          {getProviderStatusLabel({
            isActive: provider.isActive,
            ready,
          })}
        </span>
      </div>

      <details className="group mt-4">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-2.5 text-sm font-semibold text-[#17201c] transition hover:bg-[#f0ece4] [&::-webkit-details-marker]:hidden">
          <span>Değiştir</span>
          <svg
            className="h-4 w-4 transition group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>

        <form
          id={editFormId}
          action={`/api/admin/providers/${provider.id}/update`}
          method="POST"
          className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <ProviderFormFields provider={provider} />
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AppButton type="submit" form={editFormId}>
            Kaydet
          </AppButton>
          <form
            action={`/api/admin/providers/${provider.id}/delete`}
            method="POST"
          >
            <button
              type="submit"
              disabled={provider.isActive}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {provider.isActive ? "Aktif POS Silinemez" : "Sil"}
            </button>
          </form>
        </div>
      </details>
    </section>
  );
}
