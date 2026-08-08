import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Gizlilik ve Güvenlik Politikası | Lale EDT Gıda A.Ş.",
  description:
    "Lale EDT Gıda A.Ş. gizlilik politikası, kişisel veri koruma ve ödeme güvenliği hakkında bilgilendirme.",
  alternates: {
    canonical: "https://www.laleedt.com.tr/gizlilik-ve-guvenlik",
  },
};

export default async function GizlilikVeGuvenlikPage() {
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
            Gizlilik ve Güvenlik Politikası
          </h1>
          <p className="mt-4 text-sm text-[#89938e]">
            Son güncelleme: Ağustos 2025
          </p>

          <div className="mt-8 space-y-8 text-[#3d4d45] [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#17201c] [&_p]:leading-7 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_li]:list-disc [&_li]:leading-6">

            <section>
              <h2>1. Veri Sorumlusu</h2>
              <p>
                Bu politika, <strong>{siteSettings.companyName}</strong>{" "}
                (&ldquo;Şirket&rdquo;, &ldquo;Biz&rdquo;) tarafından hazırlanmıştır.
                Şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu
                (KVKK) kapsamında veri sorumlusu sıfatını taşımaktadır.
              </p>
              {siteSettings.address && (
                <p className="mt-3">
                  <strong>Adres:</strong> {siteSettings.address}
                </p>
              )}
            </section>

            <section>
              <h2>2. Toplanan Kişisel Veriler</h2>
              <p>
                Platformumuz üzerinden işlem yapmanız sırasında aşağıdaki
                kişisel veriler toplanabilir:
              </p>
              <ul>
                <li>Ad, soyad ve iletişim bilgileri (telefon, e-posta)</li>
                <li>Teslimat ve fatura adresi</li>
                <li>Sipariş geçmişi ve tercih bilgileri</li>
                <li>
                  Ödeme işlemlerine ilişkin veriler (kart numarası{" "}
                  <strong>sistemimizde saklanmaz</strong>; yalnızca ödeme altyapı
                  sağlayıcısı tarafından işlenir)
                </li>
                <li>
                  IP adresi ve tarayıcı bilgileri (güvenlik ve log amaçlı)
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Ödeme Güvenliği</h2>
              <p>
                Kredi ve banka kartı bilgileriniz hiçbir koşulda sistemlerimizde
                depolanmaz. Tüm ödeme işlemleri, bankacılık düzenlemeleri
                çerçevesinde faaliyet gösteren ve <strong>PCI DSS</strong>{" "}
                güvenlik standartlarına uygun sanal POS altyapısı aracılığıyla
                gerçekleştirilmektedir.
              </p>
              <p className="mt-4 rounded-xl border border-[#173f32]/20 bg-[#173f32]/6 px-5 py-4 text-sm font-medium text-[#173f32]">
                Ödeme sayfalarımız <strong>SSL/TLS şifrelemesi</strong> ile
                korunmaktadır. Tarayıcı adres çubuğunuzdaki kilit simgesi
                bağlantınızın güvenli olduğunu doğrular.
              </p>
              <ul>
                <li>
                  3D Secure doğrulaması desteklenmektedir; bankanız bu
                  özelliği etkinleştirdiyse ödeme sırasında onay adımı
                  uygulanır.
                </li>
                <li>
                  Şüpheli işlemler otomatik güvenlik sistemleri tarafından
                  izlenmekte ve gerektiğinde durdurulmaktadır.
                </li>
              </ul>
            </section>

            <section>
              <h2>4. Kişisel Verilerin Kullanım Amacı</h2>
              <p>
                Toplanan kişisel veriler yalnızca aşağıdaki amaçlarla
                işlenmektedir:
              </p>
              <ul>
                <li>Siparişlerin işlenmesi ve teslimatın gerçekleştirilmesi</li>
                <li>Müşteri hizmetleri ve destek</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi (fatura, vergi)</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>
                  Açık rızanız bulunması hâlinde ticari elektronik ileti
                  gönderimi
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Verilerin Üçüncü Taraflarla Paylaşımı</h2>
              <p>
                Kişisel verileriniz; açık rızanız olmaksızın üçüncü taraflarla
                paylaşılmaz. Aşağıdaki hizmet sağlayıcılar, yalnızca hizmetin
                ifası için zorunlu ölçüde veri alır ve gizlilik sözleşmesiyle
                bağlıdır:
              </p>
              <ul>
                <li>Ödeme altyapısı ve sanal POS sağlayıcısı</li>
                <li>Kargo ve lojistik firmaları</li>
                <li>
                  Yasal zorunluluk hâlinde yetkili kamu kurumları ve mahkemeler
                </li>
              </ul>
            </section>

            <section>
              <h2>6. Çerezler (Cookies)</h2>
              <p>
                Platformumuz oturum yönetimi ve güvenlik amacıyla zorunlu
                çerezler kullanmaktadır. Bu çerezler, kullanıcı tercihlerini
                hatırlamak ve yetkisiz erişimi engellemek için gereklidir.
                Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz;
                ancak zorunlu çerezlerin devre dışı bırakılması hizmetin
                çalışmasını olumsuz etkileyebilir.
              </p>
            </section>

            <section>
              <h2>7. Veri Saklama Süresi</h2>
              <p>
                Kişisel verileriniz, işlem amacının ortadan kalkmasından ve
                yasal saklama sürelerinin sona ermesinden sonra silinir veya
                anonim hâle getirilir. Fatura ve muhasebe kayıtları Türk Ticaret
                Kanunu gereğince <strong>10 yıl</strong> saklanmaktadır.
              </p>
            </section>

            <section>
              <h2>8. KVKK Kapsamındaki Haklarınız</h2>
              <p>
                6698 sayılı KVKK&apos;nın 11. maddesi uyarınca aşağıdaki
                haklara sahipsiniz:
              </p>
              <ul>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>
                  Verilerin eksik veya yanlış işlenmesi hâlinde düzeltilmesini
                  isteme
                </li>
                <li>
                  KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde
                  silinmesini veya yok edilmesini isteme
                </li>
                <li>
                  İşlemeye itiraz etme ve zararın giderilmesini talep etme
                </li>
              </ul>
              <p>
                Bu haklarınızı kullanmak için{" "}
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]"
                >
                  {siteSettings.email}
                </a>{" "}
                adresine yazılı başvurabilirsiniz.
              </p>
            </section>

            <section>
              <h2>9. İletişim</h2>
              <p>
                Gizlilik politikamıza ilişkin sorularınız için:
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
          <Link href="/gizlilik-ve-guvenlik" className="font-medium text-[#17201c]">
            Gizlilik ve Güvenlik Politikası
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/iptal-ve-iade" className="hover:text-[#17201c] transition">
            İptal ve İade Şartları
          </Link>
        </nav>
      </div>
    </main>
  );
}
