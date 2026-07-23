import Link from "next/link";

type CategoryCardProps = {
  href: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  eyebrow?: string;
  count?: number;
};

export function CategoryCard({
  href,
  title,
  description,
  imageUrl,
  eyebrow = "Kategori",
  count,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative min-h-64 overflow-hidden rounded-[1.75rem] bg-[#173f32] shadow-lg shadow-[#10231d]/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(194,133,62,0.55),transparent_38%),linear-gradient(135deg,#173f32,#0d2920)]">
          <span className="absolute right-5 top-1 text-[8rem] font-black leading-none text-white/[0.06]">
            {title.charAt(0)}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#081b15]/95 via-[#10231d]/30 to-transparent" />
      <div className="relative flex min-h-64 flex-col justify-end p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5b06e]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.025em]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
            {description}
          </p>
        )}
        <span className="mt-4 inline-flex items-center justify-between gap-3 text-sm font-bold">
          <span>{count === undefined ? "Keşfet" : `${count} ürün`}</span>
          <span className="transition group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
