import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings, getTelephoneHref } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Hizmet Sözleşmesi | Lale EDT Gıda A.Ş.",
  description:
    "Lale EDT Gıda A.Ş. web sitesi ve dijital katalog hizmetinin kullanım koşulları.",
  alternates: {
    canonical: "https://www.laleedt.com.tr/hizmet-sozlesmesi",
  },
};

export default async function HizmetSozlesmesiPage() {
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
            Hizmet Sözleşmesi
          </h1>
          <p className="mt-4 text-sm text-[#89938e]">Son güncelleme: Eylül 2026</p>

          <div className="mt-8 space-y-8 text-[#3d4d45] [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#17201c] [&_p]:leading-7 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_li]:list-disc [&_li]:leading-6">
            <section>
              <h2>1. Taraflar ve hizmetin kapsamı</h2>
              <p>
                Bu sözleşme, <strong>{siteSettings.companyName}</strong>
                (&ldquo;Şirket&rdquo;) tarafından işletilen web sitesi ve ürün
                kataloğunun (&ldquo;Site&rdquo;) ziyaretçiler tarafından
                kullanım koşullarını düzenler. Site üzerinden ürün grupları
                incelenebilir ve Şirketin iletişim kanallarına erişilebilir.
                Kullanıcı, Siteyi aşağıdaki koşullara uygun şekilde
                kullanmalıdır.
              </p>
              <p>
                Site kataloğu ürün tanıtımı ve bilgi sunma amacı taşır; tek
                başına satış teklifi, stok taahhüdü veya sipariş onayı değildir.
                Güncel ürün uygunluğu, fiyat, teslimat ve satış koşulları
                Şirket tarafından ayrıca teyit edilir. Satış gerçekleşmesi
                hâlinde ilgili koşullar siparişe özgü bilgilendirme ve satış
                sözleşmesine tabidir.
              </p>
            </section>

            <section>
              <h2>2. Kullanıcının yükümlülükleri</h2>
              <p>Kullanıcı Siteyi yürürlükteki mevzuata uygun kullanır ve:</p>
              <ul>
                <li>Siteye veya diğer kullanıcıların erişimine zarar verecek işlemler yapmaz.</li>
                <li>Yetkisiz erişim girişiminde bulunmaz; zararlı yazılım, yanıltıcı içerik veya istenmeyen ileti göndermez.</li>
                <li>Site içeriğini Şirketin veya hak sahibinin izni olmadan ticari amaçla kopyalamaz, yayımlamaz ya da kullanmaz.</li>
                <li>İletişim formları veya diğer kanallar üzerinden doğru ve hukuka uygun bilgi verir.</li>
              </ul>
            </section>

            <section>
              <h2>3. Fikri mülkiyet</h2>
              <p>
                Site üzerinde yer alan metin, görsel, logo, tasarım ve diğer
                içerikler, aksi belirtilmedikçe Şirkete veya ilgili hak
                sahiplerine aittir ve fikri mülkiyet mevzuatıyla korunur.
                İçerikler yalnızca kişisel ve ticari olmayan şekilde
                görüntülenebilir; çoğaltma, dağıtma veya başka bir yerde
                yayımlama için hak sahibinin önceden izni gerekir.
              </p>
            </section>

            <section>
              <h2>4. Erişilebilirlik ve üçüncü taraf hizmetleri</h2>
              <p>
                Şirket Siteyi erişilebilir ve güncel tutmak için makul çaba
                gösterir; bakım, teknik arıza veya Şirketin kontrolü dışındaki
                nedenlerle erişimde geçici kesintiler yaşanabilir. Sitedeki
                üçüncü taraf sayfalara verilen bağlantılar ilgili tarafların
                içerik ve hizmet koşullarına tabidir.
              </p>
            </section>

            <section>
              <h2>5. Sorumluluk ve yasal haklar</h2>
              <p>
                Site içeriği genel bilgilendirme amacıyla sunulur. Ürün
                özellikleri ve bulunabilirliği satış öncesinde Şirketten teyit
                edilmelidir. Bu sözleşmedeki hiçbir hüküm, tüketicinin emredici
                mevzuattan doğan haklarını veya Şirketin kanunen kaldırılamayan
                sorumluluklarını ortadan kaldırmaz.
              </p>
            </section>

            <section>
              <h2>6. Kişisel veriler</h2>
              <p>
                Site kullanımı sırasında kişisel verilerin işlenmesi hakkında
                ayrıntılı bilgi için <Link href="/gizlilik-ve-guvenlik" className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]">Gizlilik ve Güvenlik Politikası</Link>
                sayfasını inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2>7. Koşullardaki değişiklikler</h2>
              <p>
                Şirket, güncel sözleşme metnini bu sayfada yayımlar. Değişiklikler
                yayımlandıkları tarihten itibaren geçerlidir; daha önce kurulmuş
                sipariş sözleşmelerini geriye dönük olarak değiştirmez. Kullanıcı
                Siteyi kullanırken güncel metni inceleyebilir.
              </p>
            </section>

            <section>
              <h2>8. İletişim</h2>
              <p>Bu sözleşme veya Site hizmetleri hakkında:</p>
              <ul>
                <li><strong>Şirket:</strong> {siteSettings.companyName}</li>
                {siteSettings.address && <li><strong>Adres:</strong> {siteSettings.address}</li>}
                <li><strong>Telefon:</strong> <a className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]" href={getTelephoneHref(siteSettings.primaryPhone)}>{siteSettings.primaryPhone}</a></li>
                <li><strong>E-posta:</strong> <a className="text-[#173f32] underline decoration-[#173f32]/30 hover:decoration-[#173f32]" href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a></li>
              </ul>
            </section>
          </div>
        </article>

        <nav aria-label="Yasal sayfalar" className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#89938e]">
          <Link href="/" className="transition hover:text-[#17201c]">Ana Sayfa</Link>
          <Link href="/gizlilik-ve-guvenlik" className="transition hover:text-[#17201c]">Gizlilik ve Güvenlik</Link>
          <Link href="/iptal-ve-iade" className="transition hover:text-[#17201c]">İptal ve İade</Link>
          <Link href="/mesafeli-satis-sozlesmesi" className="transition hover:text-[#17201c]">Mesafeli Satış Sözleşmesi</Link>
          <Link href="/hizmet-sozlesmesi" className="font-medium text-[#17201c]">Hizmet Sözleşmesi</Link>
        </nav>
      </div>
    </main>
  );
}