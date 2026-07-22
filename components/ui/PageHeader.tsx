import { type ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  variant?: "card" | "hero";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
  variant = "card",
}: PageHeaderProps) {
  const isHero = variant === "hero";

  return (
    <section
      className={
        isHero
          ? "overflow-hidden rounded-[2rem] bg-[#10231d] p-6 text-white shadow-2xl shadow-[#10231d]/15 md:p-8"
          : "rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-xl shadow-[#10231d]/10 md:p-8"
      }
    >
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p
            className={
              isHero
                ? "mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70"
                : "text-xs font-semibold uppercase tracking-[0.24em] text-[#c2853e]"
            }
          >
            {eyebrow}
          </p>
          <h2
            className={
              isHero
                ? "text-3xl font-bold tracking-tight md:text-4xl"
                : "mt-2 text-3xl font-bold tracking-tight"
            }
          >
            {title}
          </h2>
          {description && (
            <p
              className={
                isHero
                  ? "mt-3 text-sm leading-6 text-white/65 md:text-base"
                  : "mt-3 text-sm leading-6 text-[#68746e]"
              }
            >
              {description}
            </p>
          )}
        </div>

        {(actions || aside) && (
          <div className="max-w-full shrink-0">{actions ?? aside}</div>
        )}
      </div>
    </section>
  );
}
