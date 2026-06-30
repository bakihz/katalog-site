# Katalog Site — Lale EDT Gıda

Lale EDT Gıda için geliştirilen Next.js tabanlı ürün kataloğu, geçici kapak sayfası, temsilci tahsilat paneli, sanal POS ödeme akışı ve admin yönetim paneli uygulamasıdır.

> Not: Bu proje Next.js `16.2.6` kullanır. Bu sürümde bazı API ve dosya yapısı davranışları eski Next.js alışkanlıklarından farklı olabilir. Kod yazmadan önce `AGENTS.md` notunu ve gerekiyorsa `node_modules/next/dist/docs/` altındaki ilgili Next.js dokümanını kontrol edin.

---

## Türkçe

### Güncel durum

- `/` adresi geçici kapak sayfasına yönlenir.
- Kapak sayfasında firma logosu, telefon, e-posta, adres ve çalışma saatleri bulunur.
- Telefon, e-posta ve adres alanları tıklanabilir durumdadır.
- Adres bağlantısı Google Haritalar üzerinde “Lale EDT Gıda” aramasına yönlendirir.
- Temsilciler `/giris` üzerinden giriş yapıp `/panel` altında kendi tahsilat işlemlerini yönetebilir.
- Admin panel `/admin` altında ürün, temsilci, ödeme ve sanal POS yönetimi için kullanılır.
- Ziraat / Nestpay 3D Pay sanal POS akışı çalışır durumdadır.
- Başarılı ödemeler için dekont/PDF paylaşım akışı bulunur.
- Ödeme durumları kullanıcı arayüzünde Türkçe gösterilir.
- 1 saatten eski bekleyen ödemeler admin panelden “Süresi Doldu” durumuna alınabilir.
- UI ve layout yapısı modülerleştirilmeye başlanmıştır.

### Teknolojiler

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Prisma `6.19.3`
- SQL Server
- jsPDF
- Docker / Docker Compose
- PM2

### Ana klasör yapısı

| Yol | Açıklama |
| --- | --- |
| `app/` | Next.js App Router sayfaları ve route handler dosyaları. |
| `app/admin/` | Admin panel sayfaları. |
| `app/panel/` | Temsilci paneli sayfaları. |
| `app/api/` | Ürün, admin, temsilci ve ödeme API route'ları. |
| `app/payment/` | Bankadan dönen public ödeme success/fail POST route'ları. |
| `app/odeme/` | Public ödeme ve ödeme sonucu sayfaları. |
| `components/layout/` | Admin/panel için ortak dashboard shell ve navigasyon component'leri. |
| `components/payment/` | Ortak ödeme formu, kart görseli ve ödeme form yardımcıları. |
| `components/ui/` | Ortak Button, PageHeader, StatCard ve ödeme durum rozeti component'leri. |
| `lib/` | Prisma, auth, ödeme, format ve yardımcı fonksiyonlar. |
| `prisma/schema.prisma` | Veritabanı modelleri. |
| `public/logo.svg` | Site ve panel logosu. |
| `proxy.ts` | Admin ve temsilci route koruması. |

### Önemli route'lar

| Route | Açıklama |
| --- | --- |
| `/` | Geçici sayfaya yönlendirir. |
| `/gecici` | Yapım aşamasında / kapak sayfası. |
| `/giris` | Temsilci giriş ekranı. |
| `/panel` | Temsilci dashboard. |
| `/panel/odeme` | Temsilci ödeme alma ekranı. |
| `/panel/islemler` | Temsilcinin kendi işlem listesi. |
| `/panel/dekont/[id]` | Temsilci işlem dekontu. |
| `/admin/login` | Admin giriş ekranı. |
| `/admin` | Admin dashboard. |
| `/admin/payments` | Tüm ödeme kayıtları. |
| `/admin/agents` | Temsilci yönetimi. |
| `/admin/providers` | Sanal POS sağlayıcı yönetimi. |
| `/admin/import` | Ürün içe aktarma. |
| `/odeme` | Public ödeme sayfası. |
| `/odeme/basarili` | Başarılı ödeme sonucu ve dekont ekranı. |
| `/odeme/hatali` | Hatalı ödeme sonucu. |
| `/urun/[slug]` | Ürün detay sayfası. |

### API / ödeme akışı

- `/api/payment` ödeme başlatır.
- Public ödeme akışı banka dönüşünde:
  - `/payment/success`
  - `/payment/fail`
- Temsilci ödeme akışı banka dönüşünde:
  - `/api/payment/agent-success`
  - `/api/payment/agent-fail`
- Aktif POS sağlayıcısı `PaymentProvider` tablosundan seçilir.
- Hassas Ziraat bilgileri `.env` içinden okunur.
- Kart bilgileri veritabanına kaydedilmez.

### Ödeme durumları

Arayüzde ödeme durumları merkezi helper üzerinden Türkçe gösterilir:

| DB / Internal | UI |
| --- | --- |
| `Pending` | Bekliyor |
| `Paid` | Başarılı |
| `success` | Başarılı |
| `Failed` | Başarısız |
| `Expired` | Süresi Doldu |
| `Cancelled` | İptal Edildi |

İlgili dosya:

```text
lib/paymentStatus.ts
```

### Veritabanı modelleri

Ana Prisma modelleri:

- `Product`: Ürün katalog kayıtları.
- `User`: Temsilci kullanıcıları.
- `Payment`: Ödeme / tahsilat kayıtları.
- `PaymentProvider`: Sanal POS sağlayıcı kayıtları.

### Ortam değişkenleri

`.env` dosyası repoya gönderilmemelidir.

Gerekli değişkenler:

```env
DATABASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
SESSION_SECRET=
APP_URL=
ZIRAAT_CLIENT_ID=
ZIRAAT_STORE_KEY=
ZIRAAT_GATEWAY_URL=
```

Notlar:

- `APP_URL` canlı ortamda gerçek domain olmalıdır.
- Ziraat / Nestpay bilgileri canlı sunucuda doğru ve gizli tutulmalıdır.
- Admin şifresi güçlü olmalıdır.

### Lokal geliştirme

Bağımlılıkları kur:

```bash
npm install
```

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

Tarayıcıdan aç:

```text
http://localhost:3000
```

Kontrol komutları:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Windows PowerShell script policy sorunlarında `npm` yerine `npm.cmd` kullanılabilir:

```bash
npm.cmd run dev
npm.cmd run build
```

### Docker / SQL Server

SQL Server için Docker Compose kullanılabilir:

```bash
docker compose up -d
```

Container adı çakışırsa mevcut container kontrol edilmelidir:

```bash
docker ps -a
```

### Sunucuda deploy / güncelleme

Tipik canlı güncelleme akışı:

```bash
git pull origin master
npm install
npm run build
pm2 restart katalog-site
pm2 save
pm2 status
```

PM2 process adı bilinmiyorsa:

```bash
pm2 list
```

Eğer deploy sonrası Next.js eski/yeni build karışması gibi davranırsa:

```bash
pm2 stop katalog-site
rm -rf .next
npm run build
pm2 start katalog-site
pm2 save
```

> Bu komutları doğru proje klasöründeyken çalıştırın.

### Sunucu yeniden başlatma notları

Elektrik kesintisi / reboot sonrası:

- BIOS power restore açık olmalı.
- Docker servisi enable olmalı.
- SQL Server container restart policy ile yeniden başlamalı.
- PM2 startup ayarı yapılmış olmalı.
- PM2 process listesi kaydedilmiş olmalı.

Kontrol:

```bash
systemctl status docker
sudo docker ps -a
pm2 status
```

### Git çalışma düzeni

Şu an ekip zaman zaman doğrudan `master` üzerinden çalışıyor. Çakışma riskini azaltmak için ideal akış:

```bash
git switch master
git pull origin master
git switch -c codex/is-adi
```

İş bitince:

```bash
git status
git add .
git commit -m "Kısa ve net commit mesajı"
git push -u origin codex/is-adi
```

Sonra GitHub üzerinden Pull Request açılır ve `master` branch'ine merge edilir.

Doğrudan `master` kullanılacaksa en azından işe başlamadan önce:

```bash
git pull origin master
```

iş bitince:

```bash
git status
git add .
git commit -m "Açıklayıcı commit mesajı"
git push
```

### Son yapılan önemli işler

- Geçici kapak sayfası hazırlandı.
- Logo ve favicon düzenlendi.
- Telefon, e-posta ve adres linkleri tıklanabilir hale getirildi.
- Admin panel temel ekranları oluşturuldu.
- Temsilci giriş ve temsilci panel akışı eklendi.
- Temsilcilerin kendi ödeme işlemlerini görmesi sağlandı.
- Ortak public/temsilci ödeme formu oluşturuldu.
- Kart görseli ve kart bilgisi giriş alanları iyileştirildi.
- Kart numarası görselde ilk 4 ve son 4 hane açık, orta haneler maskeli gösterilecek şekilde düzenlendi.
- Ziraat / Nestpay 3D Pay ödeme akışı çalışır hale getirildi.
- Dekont/PDF paylaşım özelliği eklendi.
- Ödeme durumları merkezi helper ile Türkçeleştirildi.
- Eski bekleyen ödemeleri “Süresi Doldu” yapma admin aksiyonu eklendi.
- `components/payment` klasörüyle ödeme formu modüler hale getirildi.
- `components/ui` klasörüyle ortak UI component'leri çıkarıldı.
- `components/layout` klasörüyle admin/panel dashboard layout tekrarları birleştirildi.
- `lib/format.ts` ile para, sayı ve tarih formatları merkezi hale getirildi.

### Bilinen notlar / sonraki işler

- Tek login ve rol bazlı yönlendirme değerlendirilecek.
- Admin şifre değiştirme ekranı eklenmeli.
- Login denemeleri için rate limit eklenmeli.
- Ödeme callback route'larında tekrar eden mantık servis katmanına taşınmalı.
- Ürün import route'u ve eski ürün sayfaları lint açısından temizlenmeli.
- Prisma `Payment.status` ileride enum yapısına taşınabilir.
- Para alanları şu an `Float`; finansal hesaplar için ileride daha güvenli strateji değerlendirilmeli.
- Admin ve temsilci yetkileri uzun vadede DB tabanlı role sistemiyle netleştirilmeli.

---

## English

### Project overview

This is a Next.js based product catalog, temporary landing page, agent collection panel, virtual POS payment flow and admin management panel for Lale EDT Gıda.

### Current status

- `/` redirects visitors to the temporary landing page.
- The temporary page includes logo, phone, email, address and business hours.
- Phone, email and address fields are clickable.
- Agents can log in from `/giris` and manage their own collection records under `/panel`.
- Admin screens live under `/admin`.
- Ziraat / Nestpay 3D Pay payment flow is working.
- Successful payments can generate/share receipt PDFs.
- Payment statuses are displayed in Turkish through a centralized helper.
- Old pending payments can be marked as expired from the admin payments page.
- UI and layout structure has been modularized.

### Tech stack

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Prisma `6.19.3`
- SQL Server
- jsPDF
- Docker / Docker Compose
- PM2

### Main folders

| Path | Description |
| --- | --- |
| `app/` | Next.js App Router pages and route handlers. |
| `app/admin/` | Admin panel pages. |
| `app/panel/` | Agent panel pages. |
| `app/api/` | API routes for products, admin, agents and payments. |
| `app/payment/` | Public payment success/fail POST routes used by the bank. |
| `app/odeme/` | Public payment and payment result pages. |
| `components/layout/` | Shared dashboard shell and navigation components. |
| `components/payment/` | Shared payment form, card preview and payment form utilities. |
| `components/ui/` | Shared Button, PageHeader, StatCard and status badge components. |
| `lib/` | Prisma, auth, payment, formatting and helper functions. |
| `prisma/schema.prisma` | Database models. |
| `public/logo.svg` | Site and panel logo. |
| `proxy.ts` | Admin and agent route protection. |

### Main routes

| Route | Description |
| --- | --- |
| `/` | Redirects to the temporary page. |
| `/gecici` | Temporary under-construction landing page. |
| `/giris` | Agent login page. |
| `/panel` | Agent dashboard. |
| `/panel/odeme` | Agent payment page. |
| `/panel/islemler` | Agent transaction list. |
| `/panel/dekont/[id]` | Agent receipt page. |
| `/admin/login` | Admin login page. |
| `/admin` | Admin dashboard. |
| `/admin/payments` | Payment records. |
| `/admin/agents` | Agent management. |
| `/admin/providers` | Virtual POS provider management. |
| `/admin/import` | Product import. |
| `/odeme` | Public payment page. |
| `/odeme/basarili` | Successful payment and receipt page. |
| `/odeme/hatali` | Failed payment page. |
| `/urun/[slug]` | Product detail page. |

### Payment flow

- `/api/payment` starts a payment request.
- Public bank callbacks:
  - `/payment/success`
  - `/payment/fail`
- Agent bank callbacks:
  - `/api/payment/agent-success`
  - `/api/payment/agent-fail`
- The active POS provider is selected from the `PaymentProvider` table.
- Sensitive Ziraat credentials are read from `.env`.
- Card details are not stored in the database.

### Payment statuses

| DB / Internal | UI |
| --- | --- |
| `Pending` | Bekliyor |
| `Paid` | Başarılı |
| `success` | Başarılı |
| `Failed` | Başarısız |
| `Expired` | Süresi Doldu |
| `Cancelled` | İptal Edildi |

Related file:

```text
lib/paymentStatus.ts
```

### Database models

Main Prisma models:

- `Product`: Product catalog records.
- `User`: Agent users.
- `Payment`: Payment / collection records.
- `PaymentProvider`: Virtual POS provider records.

### Environment variables

The `.env` file must not be committed.

Required variables:

```env
DATABASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
SESSION_SECRET=
APP_URL=
ZIRAAT_CLIENT_ID=
ZIRAAT_STORE_KEY=
ZIRAAT_GATEWAY_URL=
```

Notes:

- `APP_URL` must match the production domain in production.
- Ziraat / Nestpay credentials must be configured securely on the server.
- Admin credentials must be strong.

### Local development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

On Windows PowerShell, use `npm.cmd` if script execution is blocked:

```bash
npm.cmd run dev
npm.cmd run build
```

### Server deployment

Typical production update flow:

```bash
git pull origin master
npm install
npm run build
pm2 restart katalog-site
pm2 save
pm2 status
```

If PM2 process name is unknown:

```bash
pm2 list
```

If old/new Next.js build mismatch appears:

```bash
pm2 stop katalog-site
rm -rf .next
npm run build
pm2 start katalog-site
pm2 save
```

Run these commands only inside the correct project directory.

### Git workflow

Preferred workflow:

```bash
git switch master
git pull origin master
git switch -c codex/task-name
```

After completing the work:

```bash
git status
git add .
git commit -m "Short clear commit message"
git push -u origin codex/task-name
```

Then open a Pull Request on GitHub and merge it into `master`.

If working directly on `master`, always pull first and push after committing:

```bash
git pull origin master
git status
git add .
git commit -m "Clear commit message"
git push
```

### Recent important changes

- Temporary landing page was created.
- Logo and favicon were configured.
- Phone, email and address links were made clickable.
- Admin panel pages were added.
- Agent login and agent panel flow were added.
- Agent-specific payment and transaction views were added.
- Shared public/agent payment form was created.
- Card preview and card input UX were improved.
- Card number preview masks middle digits.
- Ziraat / Nestpay 3D Pay payment flow was completed.
- Receipt/PDF sharing was added.
- Payment statuses were centralized and translated for UI.
- Admin action for expiring old pending payments was added.
- Payment form was modularized under `components/payment`.
- Shared UI components were added under `components/ui`.
- Admin and agent dashboard layouts were unified under `components/layout`.
- Currency, number and date formatting were centralized in `lib/format.ts`.

### Known notes / next steps

- Consider a single login flow with role-based redirects.
- Add admin password change screen.
- Add login rate limiting.
- Move repeated payment callback logic into a service layer.
- Clean up lint issues in product import and old product/original pages.
- Consider moving `Payment.status` to a Prisma enum.
- Consider a safer money representation than `Float`.
- Move admin/agent authorization to a clearer DB-backed role model later.
