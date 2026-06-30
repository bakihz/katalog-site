import { type ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  helper?: string;
  accentClassName?: string;
  icon?: ReactNode;
  hint?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  helper,
  accentClassName,
  icon,
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={[
        "rounded-[1.5rem] border border-[#17201c]/10 bg-white p-6 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon || hint ? (
        <div className="mb-5 flex items-center justify-between">
          {icon ? (
            <span className="grid size-11 place-items-center rounded-2xl bg-[#edf1ec] text-lg text-[#173f32]">
              {icon}
            </span>
          ) : (
            <span />
          )}
          {hint && (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938e]">
              {hint}
            </span>
          )}
        </div>
      ) : accentClassName ? (
        <div className={`mb-5 h-1.5 w-14 rounded-full ${accentClassName}`} />
      ) : null}

      <p className="text-sm font-semibold text-[#68746e]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        {value}
      </p>
      {helper && <p className="mt-2 text-sm text-[#7a867f]">{helper}</p>}
    </div>
  );
}
