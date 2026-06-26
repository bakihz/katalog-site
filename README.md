# Katalog Site — Lale EDT Gıda

Bu proje, Lale EDT Gıda için geliştirilen Next.js tabanlı ürün kataloğu, temsilci paneli, ödeme akışı ve yönetim paneli uygulamasıdır.

> Not: Projede kullanılan Next.js sürümü güncel ve bazı eski alışkanlıklardan farklı davranabiliyor. Kod yazmadan önce `AGENTS.md` içindeki notu dikkate alın ve gerekiyorsa `node_modules/next/dist/docs/` altındaki ilgili Next.js dokümanını kontrol edin.

## Türkçe

### Şu anki durum

- Ana sayfa geçici olarak `/gecici` sayfasına yönleniyor.
- Ziyaretçiler ilk girişte “yapım aşamasında / çok yakında” kapak sayfasını görüyor.
- Kapak sayfasında Lale EDT Gıda logosu, telefon numaraları, e-posta, adres ve çalışma saatleri yer alıyor.
- Telefon, e-posta ve adres tıklanabilir durumda:
  - Telefon linkleri mobilde doğrudan arama başlatır.
  - E-posta linki mail uygulamasını açar.
  - Adres linki Google Haritalar’da Lale EDT Gıda konumunu arar.
- Sekmede görünen site ikonu `public/logo.svg` üzerinden ayarlanmıştır.
- Mail order / ödeme tarafı şimdilik bilinçli olarak ana çalışma kapsamının dışında tutuluyor.
- Bir sonraki ana hedef: admin dashboard ve yönetim panelini daha düzenli, kullanışlı ve güvenli hale getirmek.

### Kullanılan teknolojiler

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Prisma `6.19.3`
- SQL Server
- PM2 ile sunucu tarafında çalıştırma

### Önemli klasörler ve dosyalar

| Yol | Açıklama |
| --- | --- |
| `app/page.tsx` | Ana giriş noktası. Şu an `/gecici` sayfasına yönlendiriyor. |
| `app/gecici/page.tsx` | Geçici kapak / yapım aşamasında sayfası. |
| `app/layout.tsx` | Global metadata, HTML dili ve site ikon ayarları. |
| `public/logo.svg` | Sitede ve tarayıcı sekmesinde kullanılan logo. |
| `app/admin` | Admin panel sayfaları. |
| `app/panel` | Temsilci paneli sayfaları. |
| `app/api` | API route’ları; admin, temsilci, ürün ve ödeme işlemleri burada. |
| `prisma/schema.prisma` | Veritabanı modelleri. |
| `middleware.ts` | Admin ve temsilci paneli giriş kontrolleri. |
| `lib` | Prisma bağlantısı, auth yardımcıları ve ödeme yardımcı fonksiyonları. |

### Mevcut ana sayfalar

- `/` → `/gecici` sayfasına yönlenir.
- `/gecici` → Geçici bilgilendirme / kapak sayfası.
- `/admin/login` → Admin girişi.
- `/admin` → Admin dashboard.
- `/admin/payments` → Ödeme kayıtları.
- `/admin/agents` → Temsilci yönetimi.
- `/admin/providers` → Sanal POS sağlayıcıları.
- `/admin/import` → Ürün içe aktarma.
- `/giris` → Temsilci girişi.
- `/panel` → Temsilci dashboard.
- `/panel/odeme` → Temsilci ödeme alma ekranı.
- `/panel/islemler` → Temsilci işlem listesi.
- `/urun/[slug]` → Ürün detay sayfası.

### Veritabanı modelleri

Projede şu ana modeller bulunuyor:

- `Product`: Ürün kataloğu kayıtları.
- `User`: Temsilci kullanıcıları.
- `Payment`: Ödeme / tahsilat kayıtları.
- `PaymentProvider`: Sanal POS sağlayıcı bilgileri.

### Ortam değişkenleri

`.env` dosyası repoya gönderilmemelidir. Gerekli değişkenler:

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

Ödeme entegrasyonu kullanılacaksa Ziraat / Nestpay tarafındaki gerçek bilgiler sunucudaki `.env` içine girilmelidir.

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

Windows PowerShell üzerinde komut çalıştırırken gerekirse `npm` yerine `npm.cmd` kullanılabilir.

### Sunucuda çalışma notları

Sunucuda repo güncellendikten sonra tipik akış:

```bash
git pull origin master
npm install
npm run build
pm2 restart <uygulama-adi>
pm2 save
pm2 status
```

Eğer PM2 process adı bilinmiyorsa:

```bash
pm2 list
```

### Git çalışma düzeni

Çakışma yaşamamak için doğrudan `master` üzerinde geliştirme yapmak yerine branch ile çalışmak daha güvenlidir.

Önerilen akış:

```bash
git switch master
git pull origin master
git switch -c codex/yapilacak-is-adi
```

İş bitince:

```bash
git status
git add .
git commit -m "Kısa ve net commit mesajı"
git push -u origin codex/yapilacak-is-adi
```

Sonra GitHub üzerinden Pull Request açılıp `master` branch’ine merge edilir.

### Şu ana kadar yapılan önemli işler

- Proje ilk kez incelendi ve genel mimari değerlendirildi.
- Geçici olarak eğlenceli bir sayfa fikri denendi, sonra iptal edilip gerçek kapak sayfasına geçildi.
- Müşterilerin siteye ilk girdiğinde göreceği geçici kapak sayfası hazırlandı.
- Kapak sayfası 1920×1080 ekranda taşma yapmayacak şekilde sıkılaştırıldı.
- Logo sayfaya eklendi ve tarayıcı sekmesi ikonu olarak kullanıldı.
- Telefon, e-posta ve adres linkleri tıklanabilir hale getirildi.
- Adres Google Haritalar’a yönlenecek şekilde düzenlendi.
- Değişiklikler GitHub üzerinden `master` branch’ine aktarıldı.
- Sunucuda `git pull` ile çekildi ve PM2 üzerinden çalıştırıldı.

### Bilinen notlar / sonraki işler

- Admin panel tasarımı ve kullanılabilirliği geliştirilecek.
- Mail order / ödeme tarafına şimdilik dokunulmamalı.
- Ürün içe aktarma, ödeme callback’leri ve bazı admin API’leri ayrıca güvenlik açısından gözden geçirilmeli.
- Ödeme durumlarında `success` ve `Paid` gibi farklı status değerleri kullanılıyor; ileride tek standarda çekilmeli.
- Para alanları şu an `Float`; finansal hesaplar için ileride daha güvenli bir veri tipi/strateji değerlendirilmeli.
- Production ortamında `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` güçlü ve gizli tutulmalı.

---

## English

### Project overview

This is a Next.js based catalog, agent panel, payment flow and admin panel project for Lale EDT Gıda.

The current public homepage is intentionally redirected to a temporary “coming soon / under construction” landing page while the main website and admin improvements are being prepared.

### Current status

- `/` redirects visitors to `/gecici`.
- Visitors see a temporary landing page with company information.
- The temporary page includes the company logo, phone numbers, email address, physical address and business hours.
- Phone, email and address entries are clickable:
  - Phone links start a call on mobile devices.
  - Email opens the user’s mail client.
  - Address opens Google Maps search for Lale EDT Gıda.
- The browser tab icon uses `public/logo.svg`.
- Mail order / payment logic is intentionally not the current focus.
- Next main goal: improve the admin dashboard and management panel.

### Tech stack

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Prisma `6.19.3`
- SQL Server
- PM2 for running the app on the server

### Important folders and files

| Path | Description |
| --- | --- |
| `app/page.tsx` | Main entry point. Currently redirects to `/gecici`. |
| `app/gecici/page.tsx` | Temporary landing / under construction page. |
| `app/layout.tsx` | Global metadata, HTML language and icon settings. |
| `public/logo.svg` | Logo used on the page and browser tab. |
| `app/admin` | Admin panel pages. |
| `app/panel` | Agent panel pages. |
| `app/api` | API routes for admin, agents, products and payments. |
| `prisma/schema.prisma` | Database models. |
| `middleware.ts` | Admin and agent route protection. |
| `lib` | Prisma client, auth helpers and payment helper functions. |

### Main routes

- `/` → redirects to `/gecici`.
- `/gecici` → Temporary landing page.
- `/admin/login` → Admin login.
- `/admin` → Admin dashboard.
- `/admin/payments` → Payment records.
- `/admin/agents` → Agent management.
- `/admin/providers` → Virtual POS providers.
- `/admin/import` → Product import.
- `/giris` → Agent login.
- `/panel` → Agent dashboard.
- `/panel/odeme` → Agent payment page.
- `/panel/islemler` → Agent transaction list.
- `/urun/[slug]` → Product detail page.

### Database models

The main Prisma models are:

- `Product`: Product catalog records.
- `User`: Agent users.
- `Payment`: Payment / collection records.
- `PaymentProvider`: Virtual POS provider records.

### Environment variables

The `.env` file must not be committed to the repository. Required variables:

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

If the payment integration is enabled, real Ziraat / Nestpay credentials must be configured in the server `.env` file.

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

On Windows PowerShell, use `npm.cmd` instead of `npm` if the shell blocks script execution.

### Server notes

Typical deployment flow after pulling the latest code:

```bash
git pull origin master
npm install
npm run build
pm2 restart <app-name>
pm2 save
pm2 status
```

If the PM2 process name is unknown:

```bash
pm2 list
```

### Git workflow

To avoid conflicts, use feature branches instead of working directly on `master`.

Recommended flow:

```bash
git switch master
git pull origin master
git switch -c codex/task-name
```

After the work is done:

```bash
git status
git add .
git commit -m "Short clear commit message"
git push -u origin codex/task-name
```

Then open a Pull Request on GitHub and merge it into `master`.

### Completed work so far

- The project was reviewed and the general architecture was documented.
- A temporary playful page idea was tested, then reverted in favor of a real temporary landing page.
- A customer-facing temporary landing page was created.
- The landing page was adjusted to fit 1920×1080 screens without overflow.
- The company logo was added to the page and used as the browser tab icon.
- Phone, email and address entries were made clickable.
- The address was linked to Google Maps.
- Changes were merged into `master` through GitHub.
- The server pulled the latest code and the app was restarted through PM2.

### Known notes / next steps

- Improve the admin panel design and usability.
- Do not touch the mail order / payment flow for now unless explicitly planned.
- Product import, payment callbacks and some admin APIs should be reviewed from a security perspective.
- Payment statuses currently use different values such as `success` and `Paid`; they should be standardized later.
- Money amounts currently use `Float`; a safer financial data strategy should be considered later.
- Production `SESSION_SECRET`, `ADMIN_USERNAME` and `ADMIN_PASSWORD` must be strong and kept private.
