import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings, getTelephoneHref } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Lale EDT Gıda A.Ş.",
  description:
    "Lale EDT Gıda A.Ş. ile tüketici arasında uzaktan kurulan satışlara ilişkin genel sözleşme koşulları.",
  alternates: {
    canonical: "https://www.laleedt.com.tr/mesafeli-satis-sozlesmesi",
  },
};

export default async function MesafeliSatisSozlesmesiPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#17201c]">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#809087_0.7px,transparent_0.7px)] [background-size:18px_18px]" />
      <div className="absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-[#d7e3d8] blur-3xl" />
      <div className="absolute -bottom-32 right-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[#e8d7b9] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
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

        <article className="mt-10 rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_-40px_rgba(23,63,50,0.35)] backdrop-blur-xl sm:p-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#173f32]/8 px-4 py-2 text-sm font-semibold text-[#173f32]">
            <span className="size-2 rounded-full bg-[#c2853e]" />
            Yasal Bilgilendirme
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="mt-4 text-sm text-[#89938e]">Son güncelleme: Eylül 2026</p>

          <div className="mt-8 space-y-8 text-[#3d4d45] [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#17201c] [&_p]:leading-7 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_li]:list-disc [&_li]:leading-6">
            <section>
              <h2>1. Taraflar ve kapsam</h2>
              <p>
                Bu metin, tüketici sıfatıyla hareket eden alıcı ile satıcı
                <strong> {siteSettings.companyName}</strong> arasında, tarafların
                fiziksel olarak bir araya gelmediği yöntemlerle kurulan ürün
                satışlarına ilişkin genel koşulları açıklar. Satıcı iletişim
                bilgileri aşağıda yer alır:
              </p>
              <ul>
                <li><strong>Adres:</strong> {siteSettings.address ?? "Şirket iletişim adresi için bizimle iletişime geçin."}</li>
                <li><strong>Telefon:</strong> {siteSettings.primaryPhone}</li>
                <li><strong>E-posta:</strong> {siteSettings.email}</li>
              </ul>
              <p className="mt-4">
                Bu internet sitesindeki katalog ürünleri tanıtım ve bilgi
                amaçlıdır. Ürün, miktar, vergiler dâhil toplam bedel, teslimat
                ücreti ve süresi ile ödeme koşulları her satış için sipariş
                öncesinde alıcıya ayrıca bildirilir. Bu bilgiler ve siparişe
                özgü ön bilgilendirme, kurulacak sözleşmenin ayrılmaz
                parçalarıdır.
              </p>
            </section>

            <section>
              <h2>2. Sözleşmenin kurulması</h2>
              <p>
                Satış sözleşmesi, alıcının siparişe özgü ön bilgilendirmeyi
                edinmesi ve siparişini açıkça onaylamasıyla; siparişin satıcı
                tarafından kabul edilmesi üzerine kurulur. Sözleşme ve sipariş
                bilgileri, mevzuata uygun şekilde alıcıya kalıcı veri
                saklayıcısı aracılığıyla iletilir. Yalnızca katalog sayfasını
                görüntülemek sipariş veya satış sözleşmesi oluşturmaz.
              </p>
            </section>

            <section>
              <h2>3. Ürün bedeli ve ödeme</h2>
              <p>
                Alıcıya uygulanacak ürün bedeli, vergiler ve varsa teslimat
                dâhil tüm ek masraflar sipariş tamamlanmadan önce bildirilir.
                Alıcının onayladığı sipariş özeti ile kendisine iletilen ödeme
                bilgileri esas alınır. Önceden bildirilmeyen ek bir bedel
                alıcıdan talep edilmez.
              </p>
            </section>

            <section>
              <h2>4. Teslimat</h2>
              <p>
                Teslimat adresi, yöntemi, ücreti ve öngörülen teslim süresi
                sipariş öncesinde alıcıya bildirilir. Satıcı, sipariş konusu
                ürünü kararlaştırılan koşullarda ve mevzuattaki süreler içinde
                teslim eder. Alıcıdan kaynaklanan teslim edilememe hâlleri ve
                yeniden teslimat koşulları siparişe özgü olarak değerlendirilir.
              </p>
            </section>

            <section>
              <h2>5. Cayma hakkı</h2>
              <p>
                Mevzuatta öngörülen istisnalar saklı kalmak üzere tüketici,
                ürünü teslim aldığı tarihten itibaren 14 gün içinde gerekçe
                göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi bu
                süre içinde yazılı olarak veya kalıcı veri saklayıcısı
                aracılığıyla satıcıya ulaştırılmalıdır. E-posta yoluyla
                gönderilecek bildirim için aşağıdaki adres kullanılabilir.
                Bildirimde sipariş bilgileri ve cayma
                iradesinin açıkça belirtilmesi işlemin takibini kolaylaştırır.
              </p>
              <p>
                Cayma hakkının kullanılması hâlinde ürünün iadesi ve bedel
                iadesi, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
                Mesafeli Sözleşmeler Yönetmeliği hükümlerine göre yürütülür.
                İade edilecek ürün ve iade yöntemi konusunda satıcıyla iletişime
                geçilmelidir. İade kargo masrafının kime ait olacağı sipariş
                öncesi bilgilendirmede belirtilir.
              </p>
              <p>
                Cayma hakkının kullanılamadığı hâller mevzuatla sınırlıdır.
                Örneğin çabuk bozulabilen veya son kullanma tarihi geçebilecek
                mallar ile tesliminden sonra ambalaj, bant, mühür veya paket
                gibi koruyucu unsurları açılmış olup sağlık ve hijyen açısından
                iadeye elverişli olmayan mallar bu istisnalar kapsamında
                olabilir. İstisnalar ürünün niteliğine ve yürürlükteki mevzuata
                göre değerlendirilir.
              </p>
            </section>

            <section>
              <h2>6. Bedel iadesi ve ayıplı ürünler</h2>
              <p>
                Cayma hakkı veya mevzuat kapsamındaki diğer iade hakları
                kullanıldığında, bedel iadesi yasal süre ve usullere göre
                yapılır. Ayıplı mal hâlinde tüketicinin kanundan doğan seçimlik
                hakları saklıdır. Hasarlı veya yanlış ürün teslim alınması
                durumunda, çözümün hızlıca sağlanabilmesi için satıcıyla
                iletişime geçilmesi önerilir.
              </p>
            </section>

            <section>
              <h2>7. Uyuşmazlıkların çözümü</h2>
              <p>
                Tüketici, uyuşmazlık başvurusunu mevzuatta belirlenen parasal
                sınırlar ve görev kuralları çerçevesinde Tüketici Hakem
                Heyetine veya Tüketici Mahkemesine yapabilir. Tüketicinin
                ikametgâhının bulunduğu yerdeki başvuru imkânları saklıdır.
              </p>
            </section>

            <section>
              <h2>8. İletişim</h2>
              <p>Cayma, iade ve sözleşme soruları için:</p>
              <ul>
                <li><strong>Telefon:</strong> <a className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]" href={getTelephoneHref(siteSettings.primaryPhone)}>{siteSettings.primaryPhone}</a></li>
                <li><strong>E-posta:</strong> <a className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]" href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a></li>
                {siteSettings.address && <li><strong>Adres:</strong> {siteSettings.address}</li>}
              </ul>
            </section>
          </div>
        </article>

        <nav aria-label="Yasal sayfalar" className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#89938e]">
          <Link href="/" className="transition hover:text-[#17201c]">Ana Sayfa</Link>
          <Link href="/gizlilik-ve-guvenlik" className="transition hover:text-[#17201c]">Gizlilik ve Güvenlik</Link>
          <Link href="/iptal-ve-iade" className="transition hover:text-[#17201c]">İptal ve İade</Link>
          <Link href="/mesafeli-satis-sozlesmesi" className="font-medium text-[#17201c]">Mesafeli Satış Sözleşmesi</Link>
          <Link href="/hizmet-sozlesmesi" className="transition hover:text-[#17201c]">Hizmet Sözleşmesi</Link>
        </nav>
      </div>
    </main>
  );
}