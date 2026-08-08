import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "İptal ve İade Şartları | Lale EDT Gıda A.Ş.",
  description:
    "Lale EDT Gıda A.Ş. iptal ve iade koşulları, ödeme iptali ve para iadesi hakkındaki politikamız.",
  alternates: {
    canonical: "https://www.laleedt.com.tr/iptal-ve-iade",
  },
};

export default async function IptalVeIadePage() {
  const siteSettings = await getSiteSettings();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#17201c]">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />
      <div className="absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-[#d7e3d8] blur-3xl" />
      <div className="absolute -bottom-32 right-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[#e8d7b9] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#17201c]/10 pb-5">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl shadow-lg shadow-[#173f32]/15">
              <Image
                src={siteSettings.logoUrl}
                alt="Lale EDT logo"
                fill
                priority
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">
                {siteSettings.companyName}
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#63736b]">
                Ürün ve hizmet kataloğu
              </p>
            </div>
          </Link>
        </header>

        {/* Content */}
        <div className="mt-10 rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_-40px_rgba(23,63,50,0.35)] backdrop-blur-xl sm:p-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#173f32]/8 px-4 py-2 text-sm font-semibold text-[#173f32]">
            <span className="size-2 rounded-full bg-[#c2853e]" />
            Yasal Bilgilendirme
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            İptal ve İade Şartları
          </h1>
          <p className="mt-4 text-sm text-[#89938e]">
            Son güncelleme: Ağustos 2025
          </p>

          <div className="mt-8 space-y-8 text-[#3d4d45] [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#17201c] [&_p]:leading-7 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_li]:list-disc [&_li]:leading-6">

            <section>
              <h2>1. Genel Bilgiler</h2>
              <p>
                Bu sayfa, <strong>{siteSettings.companyName}</strong> (&ldquo;Şirket&rdquo;)
                tarafından sunulan ürün ve hizmetlere ilişkin iptal ve iade
                koşullarını açıklamaktadır. Sanal POS üzerinden gerçekleştirilen
                ödemelerde aşağıdaki kurallar geçerlidir.
              </p>
            </section>

            <section>
              <h2>2. Sipariş İptali</h2>
              <p>
                Siparişinizi iptal etmek istemeniz durumunda aşağıdaki koşullar
                geçerlidir:
              </p>
              <ul>
                <li>
                  Siparişiniz henüz hazırlık aşamasındaysa, ödeme tarihinden
                  itibaren <strong>24 saat içinde</strong> iletişime geçmeniz
                  hâlinde iptal işlemi gerçekleştirilebilir.
                </li>
                <li>
                  Siparişin sevkiyata verilmiş olması durumunda iptal talebi
                  kabul edilmez; iade prosedürü uygulanır.
                </li>
                <li>
                  İptal taleplerinde ödeme tutarının tamamı, işlemin
                  onaylanmasından itibaren <strong>3–7 iş günü</strong> içinde
                  orijinal ödeme yöntemine iade edilir.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. İade Koşulları</h2>
              <p>
                Teslim edilen ürünler için iade talebi, ürün teslim tarihinden
                itibaren <strong>14 takvim günü</strong> içinde yapılabilir. İade
                kabul edilebilmesi için aşağıdaki koşulların sağlanması
                gerekmektedir:
              </p>
              <ul>
                <li>
                  Ürünün orijinal ambalajında, kullanılmamış ve hasarsız
                  olması.
                </li>
                <li>
                  Faturanın veya satış belgesinin ibraz edilmesi.
                </li>
                <li>
                  Gıda ürünlerinde; açılmamış, son kullanma tarihi geçmemiş ve
                  soğuk zinciri bozulmamış olması.
                </li>
              </ul>
              <p className="mt-4 rounded-xl border border-[#c2853e]/25 bg-[#c2853e]/8 px-5 py-4 text-sm font-medium text-[#7a5020]">
                Açılmış, kullanılmış veya orijinal ambalajı bozulmuş gıda ürünleri
                iade kapsamı dışındadır.
              </p>
            </section>

            <section>
              <h2>4. Para İadesi Süreci</h2>
              <p>
                Onaylanan iadelerde ödeme iadesi aşağıdaki şekilde
                gerçekleştirilir:
              </p>
              <ul>
                <li>
                  Kredi kartı ile yapılan ödemelerde iade, kartı veren bankaya
                  bildirimden itibaren <strong>5–10 iş günü</strong> içinde
                  hesabınıza yansıtılır. Bu süre bankanıza göre değişkenlik
                  gösterebilir.
                </li>
                <li>
                  Banka havalesi / EFT ile yapılan ödemelerde iade, onay
                  tarihinden itibaren <strong>3–5 iş günü</strong> içinde
                  tarafınıza aktarılır.
                </li>
                <li>
                  Kısmi iadelerde yalnızca iade edilecek ürünlere karşılık gelen
                  tutar geri ödenir.
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Hasar ve Hatalı Ürün</h2>
              <p>
                Teslimat sırasında hasar görmüş veya sipariş ettiğinizden farklı
                bir ürün aldıysanız, ürünü teslim almadan önce kargo görevlisine
                tutanak tutturmanızı ve{" "}
                <strong>24 saat içinde</strong> bize bildirmenizi öneririz.
                Bu durumlarda iade ve değişim koşulsuz olarak kabul edilir.
              </p>
            </section>

            <section>
              <h2>6. İletişim</h2>
              <p>
                İptal ve iade talepleriniz için aşağıdaki kanallar üzerinden
                bize ulaşabilirsiniz:
              </p>
              <ul>
                <li>
                  <strong>Telefon:</strong>{" "}
                  <a
                    href={`tel:+90${siteSettings.primaryPhone.replace(/\D/g, "").replace(/^0/, "")}`}
                    className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]"
                  >
                    {siteSettings.primaryPhone}
                  </a>
                  {siteSettings.secondaryPhone && (
                    <>
                      {" "}·{" "}
                      <a
                        href={`tel:+90${siteSettings.secondaryPhone.replace(/\D/g, "").replace(/^0/, "")}`}
                        className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]"
                      >
                        {siteSettings.secondaryPhone}
                      </a>
                    </>
                  )}
                </li>
                <li>
                  <strong>E-posta:</strong>{" "}
                  <a
                    href={`mailto:${siteSettings.email}`}
                    className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]"
                  >
                    {siteSettings.email}
                  </a>
                </li>
                {siteSettings.address && (
                  <li>
                    <strong>Adres:</strong> {siteSettings.address}
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>

        {/* Footer nav */}
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#89938e]">
          <Link href="/" className="hover:text-[#17201c] transition">
            Ana Sayfa
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/gizlilik-ve-guvenlik" className="hover:text-[#17201c] transition">
            Gizlilik ve Güvenlik Politikası
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/iptal-ve-iade" className="font-medium text-[#17201c]">
            İptal ve İade Şartları
          </Link>
        </nav>
      </div>
    </main>
  );
}
