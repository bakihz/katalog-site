import { AppButton } from "@/components/ui";
import {
  getPublicationStatusLabel,
  type ProductPublicationStatus,
} from "@/lib/productCatalogReadiness";

type ProductPublicationPanelProps = {
  productId: number;
  logoIsActive: boolean;
  publishedAt: Date | null;
  status: ProductPublicationStatus;
  readiness: {
    blockers: string[];
    warnings: string[];
    isReady: boolean;
  };
};

function formatPublishedAt(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProductPublicationPanel({
  productId,
  logoIsActive,
  publishedAt,
  status,
  readiness,
}: ProductPublicationPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#89938e]">
            Yayın Kontrolü
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[#17201c]">
              {getPublicationStatusLabel(status)}
            </h2>
            {!logoIsActive && (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                Logo pasif — sitede görünmez
              </span>
            )}
            {status === "published" && logoIsActive && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Müşteriye açık
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68746e]">
            Zorunlu koşullar tamamlanmadan ürün yayınlanamaz. Uyarılar yayını
            engellemez ancak içerik kalitesini geliştirmek için dikkate
            alınmalıdır.
          </p>
          {publishedAt && (
            <p className="mt-2 text-xs font-semibold text-[#89938e]">
              İlk yayın: {formatPublishedAt(publishedAt)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {status !== "draft" && (
            <PublicationAction
              productId={productId}
              status="draft"
              label="Taslağa Al"
            />
          )}
          {status !== "review" && (
            <PublicationAction
              productId={productId}
              status="review"
              label="İncelemeye Gönder"
            />
          )}
          {status !== "published" && (
            <PublicationAction
              productId={productId}
              status="published"
              label="Yayına Al"
              disabled={!readiness.isReady}
              primary
            />
          )}
          {status !== "archived" && (
            <PublicationAction
              productId={productId}
              status="archived"
              label="Arşivle"
              secondary
            />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[#17201c]/10 pt-5 lg:grid-cols-2">
        <ReadinessList
          title="Zorunlu kontroller"
          items={readiness.blockers}
          emptyMessage="✓ Ürün yayına hazır."
          tone="blocker"
        />
        <ReadinessList
          title="Kalite önerileri"
          items={readiness.warnings}
          emptyMessage="✓ Ek kalite uyarısı bulunmuyor."
          tone="warning"
        />
      </div>
    </section>
  );
}

function PublicationAction({
  productId,
  status,
  label,
  disabled,
  primary,
  secondary,
}: {
  productId: number;
  status: ProductPublicationStatus;
  label: string;
  disabled?: boolean;
  primary?: boolean;
  secondary?: boolean;
}) {
  return (
    <form action={`/api/admin/products/${productId}/publication`} method="POST">
      <input type="hidden" name="status" value={status} />
      <AppButton
        type="submit"
        size="sm"
        disabled={disabled}
        variant={primary ? "primary" : secondary ? "secondary" : "outline"}
      >
        {label}
      </AppButton>
    </form>
  );
}

function ReadinessList({
  title,
  items,
  emptyMessage,
  tone,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
  tone: "blocker" | "warning";
}) {
  const isBlocker = tone === "blocker";

  return (
    <div className={`rounded-2xl p-4 ${isBlocker ? "bg-[#f8f6f1]" : "bg-amber-50"}`}>
      <p className="text-sm font-bold text-[#17201c]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-emerald-700">
          {emptyMessage}
        </p>
      ) : (
        <ul
          className={`mt-3 grid gap-2 text-sm sm:grid-cols-2 ${
            isBlocker ? "text-rose-700" : "text-amber-800"
          }`}
        >
          {items.map((item) => (
            <li key={item} className={isBlocker ? "font-semibold" : undefined}>
              {isBlocker ? "✕" : "•"} {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
