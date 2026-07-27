import Link from "next/link";

type HomepagePromoHeroProps = {
  companyName: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
};

export function HomepagePromoHero({
  companyName,
  title,
  description,
  imageUrl,
  mobileImageUrl,
  buttonLabel,
  buttonUrl,
}: HomepagePromoHeroProps) {
  const fallbackImageUrl = imageUrl || mobileImageUrl;

  return (
    <section className="relative flex min-h-[100svh] overflow-hidden bg-[#173f32] text-white lg:min-h-[min(58rem,100svh)]">
      {fallbackImageUrl ? (
        <picture className="absolute inset-0">
          {mobileImageUrl && (
            <source media="(max-width: 639px)" srcSet={mobileImageUrl} />
          )}
          <img
            src={fallbackImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </picture>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(239,180,79,0.5),transparent_27%),linear-gradient(135deg,#10231d_0%,#1d4d3d_54%,#c2853e_135%)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#071913]/90 via-[#071913]/20 to-[#071913]/20 sm:bg-gradient-to-r sm:from-[#071913]/80 sm:via-[#071913]/25 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071913]/20 via-transparent to-[#071913]/35" />

      <div className="relative mx-auto flex w-full max-w-[94rem] items-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16 sm:pt-40 lg:px-12 lg:pb-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#f3c98f] sm:text-sm">
            {companyName}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-lg sm:leading-8">
              {description}
            </p>
          )}
          {buttonLabel && buttonUrl && (
            <Link
              href={buttonUrl}
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#efb44f] px-6 py-3.5 text-sm font-black text-[#2a2114] shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:bg-[#f5c466]"
            >
              {buttonLabel}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
