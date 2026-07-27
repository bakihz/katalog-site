import Image from "next/image";
import Link from "next/link";
import { getTelephoneHref } from "@/lib/siteSettings";

type CatalogFooterProps = {
  logoUrl: string;
  companyName: string;
  primaryPhone: string;
  email: string;
  address?: string | null;
  mapsUrl?: string | null;
};

export function CatalogFooter({
  logoUrl,
  companyName,
  primaryPhone,
  email,
  address,
  mapsUrl,
}: CatalogFooterProps) {
  return (
    <footer id="iletisim" className="relative mt-16 px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8">
      <div className="mx-auto max-w-[94rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[rgba(255,255,255,0.68)] shadow-[0_8px_28px_rgba(16,35,29,0.05)] backdrop-blur-[26px] backdrop-saturate-150">
        <div className="grid gap-10 px-6 py-9 sm:px-9 sm:py-11 lg:grid-cols-[1.15fr_0.75fr_1fr] lg:gap-14 lg:px-12">
          <div>
            <Link href="/home" className="inline-flex items-center gap-4">
              <span className="relative block size-14 shrink-0 overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src={logoUrl}
                  alt="Lale EDT logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </span>
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[#c2853e]">
                  Lale EDT
                </span>
                <span className="mt-1 block text-lg font-black leading-tight text-[#173f32]">
                  {companyName}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#68746e]">
              Profesyonel mutfaklardan günlük ihtiyaçlara uzanan ürün
              gruplarımızı güvenilir tedarik anlayışıyla sunuyoruz.
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#173f32]">
              Hızlı Erişim
            </p>
            <nav className="mt-4 grid gap-1 text-sm font-bold text-[#52625b]">
              <Link
                href="/home"
                className="w-fit py-1.5 transition hover:text-[#c2853e]"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/katalog"
                className="w-fit py-1.5 transition hover:text-[#c2853e]"
              >
                Kategoriler
              </Link>
              <Link
                href="/urunler"
                className="w-fit py-1.5 transition hover:text-[#c2853e]"
              >
                Tüm Ürünler
              </Link>
              <Link
                href="/home#hakkimizda"
                className="w-fit py-1.5 transition hover:text-[#c2853e]"
              >
                Hakkımızda
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#173f32]">
              İletişim
            </p>
            <div className="mt-4 space-y-3 text-sm text-[#52625b]">
              <a
                href={getTelephoneHref(primaryPhone)}
                className="block w-fit font-bold transition hover:text-[#c2853e]"
              >
                {primaryPhone}
              </a>
              <a
                href={`mailto:${email}`}
                className="block w-fit font-bold transition hover:text-[#c2853e]"
              >
                {email}
              </a>
              {address && (
                mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-sm leading-6 transition hover:text-[#173f32]"
                  >
                    {address}
                  </a>
                ) : (
                  <p className="max-w-sm leading-6">{address}</p>
                )
              )}
            </div>
            <a
              href={`mailto:${email}`}
              className="mt-5 inline-flex rounded-full bg-[#efb44f] px-5 py-3 text-sm font-black text-[#2a2114] transition hover:bg-[#f5c466]"
            >
              Bize Ulaşın
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#173f32]/10 px-6 py-5 text-xs text-[#7e8a84] sm:flex-row sm:items-center sm:justify-between sm:px-9 lg:px-12">
          <span>© {new Date().getFullYear()} {companyName}</span>
          <span>Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
