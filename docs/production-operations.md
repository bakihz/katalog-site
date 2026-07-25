# Canlı Operasyon Rehberi

Bu doküman Lale EDT sitesinin canlı ortamda güvenli şekilde güncellenmesi, yeniden başlatılması ve yedeklenmesi için kısa operasyon rehberidir.

## Hızlı durum kontrolü

Sunucuda bir sorun olduğunda önce bu üçlüye bak:

```bash
systemctl status docker
sudo docker ps -a
pm2 status
```

Beklenen durum:

- Docker servisi `active (running)` olmalı.
- SQL Server container `Up` olmalı.
- Nginx Proxy Manager / Portainer gibi yardımcı container'lar `Up` olmalı.
- `katalog-site` PM2 üzerinde `online` görünmeli.

## Elektrik kesintisi sonrası beklenen açılış zinciri

```text
Elektrik gelir
→ BIOS makineyi açar
→ Proxmox açılır
→ Ubuntu VM açılışta otomatik başlar
→ Docker servisi başlar
→ SQL Server container unless-stopped ile ayağa kalkar
→ PM2 katalog-site uygulamasını başlatır
→ site yayına döner
```

Kontrol listesi:

- BIOS power restore açık.
- Proxmox VM için `Açılışta başlat` açık.
- Docker servisi enabled.
- SQL Server container restart policy: `unless-stopped`.
- PM2 startup ayarlı.
- PM2 process listesi kaydedilmiş: `pm2 save`.

## Canlı güncelleme prosedürü

Temsilciler işlem yaparken deploy yapılacaksa en güvenlisi kısa bir zaman aralığı seçmek ve ekibe haber vermektir. Normal deploy birkaç saniye/kısa dakika sürebilir ama ödeme formu dolduran kullanıcılar etkilenebilir.

Önerilen akış:

```bash
cd /home/lale/katalog-site
git status
git pull origin master
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart katalog-site
pm2 save
pm2 status
```

Notlar:

- `git status` temiz değilse deploy durdurulmalı ve değişikliklerin ne olduğu anlaşılmalı.
- Prisma schema değişmemişse `npx prisma db push` şart değildir ama çalıştırmadan önce migration etkisi düşünülmelidir.
- Build başarısız olursa PM2 restart yapılmamalıdır.
- Deploy sonrası admin panel, temsilci paneli ve bir ödeme test akışı kontrol edilmelidir.

## Deploy sonrası hızlı test

Tarayıcıdan:

- `/gecici` açılıyor mu?
- `/giris` açılıyor mu?
- Temsilci girişi yapılabiliyor mu?
- `/panel/odeme` ödeme formu açılıyor mu?
- `/panel/islemler` işlem listesi açılıyor mu?
- `/admin` admin paneli açılıyor mu?
- `/admin/payments` filtreler ve liste çalışıyor mu?

Sunucudan:

```bash
pm2 logs katalog-site --lines 50
```

Loglarda sürekli tekrar eden yeni hata olmamalı.

## Geri dönüş planı

Deploy sonrası kritik hata varsa:

```bash
git log --oneline -5
git revert <son_commit_hash>
npm install
npm run build
pm2 restart katalog-site
pm2 save
```

Eğer sorun sadece build cache karışmasıysa:

```bash
pm2 stop katalog-site
rm -rf .next
npm run build
pm2 restart katalog-site
pm2 save
```

`git reset --hard` canlıda son çare olarak düşünülmelidir; önce `revert` daha güvenlidir.

## Veritabanı yedekleme

SQL Server container adı genelde `sqlserver`.

Önce container adını kontrol et:

```bash
sudo docker ps -a
```

Manuel backup örneği:

```bash
sudo docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P '<SA_PASSWORD>' -C \
  -Q "BACKUP DATABASE [KatalogDb] TO DISK = N'/var/opt/mssql/backup/katalog-$(date +%F).bak' WITH INIT"
```

Backup dosyasını container dışına almak için:

```bash
sudo docker cp sqlserver:/var/opt/mssql/backup/katalog-YYYY-MM-DD.bak ./katalog-YYYY-MM-DD.bak
```

Öneri:

- Günlük otomatik DB backup kurulmalı.
- Backup dosyaları aynı makinede tek başına bırakılmamalı.
- Haftalık olarak harici disk/NAS/bulut gibi ikinci bir yere kopyalanmalı.
- Ayda en az bir kez restore testi yapılmalı.

## `.env` yedekleme

`.env` dosyası repoya gönderilmez. İçinde DB bağlantısı, oturum anahtarı ve bazı opsiyonel başlangıç/fallback bilgileri bulunur.

Zorunlu saklanması gerekenler:

- `DATABASE_URL`
- `SESSION_SECRET`

Ana sayfa yayın kontrolü:

- `PUBLIC_HOMEPAGE_ENABLED=true`: Yeni ana sayfayı herkese açar.
- Değişken tanımlı değilse veya `false` ise `/home`, normal ziyaretçileri
  `/gecici` sayfasına yönlendirir.
- Yerel geliştirme ortamı ve geçerli admin oturumu yeni ana sayfayı
  önizlemeye devam edebilir.

Opsiyonel / fallback değişkenleri:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `APP_URL`
- `ZIRAAT_CLIENT_ID`
- `ZIRAAT_STORE_KEY`
- `ZIRAAT_GATEWAY_URL`
- `PAYMENT_MAX_AMOUNT`
- `PAYMENT_DEBUG_LOGS`

Notlar:

- Admin kullanıcısı veritabanında oluşturulduktan sonra `ADMIN_USERNAME` ve `ADMIN_PASSWORD` canlı giriş için ana kaynak değildir; DB'deki admin kullanıcı kullanılır.
- Sanal POS bilgileri canlı kullanımda `/admin/providers` ekranından `PaymentProvider` tablosuna kaydedilir.
- Ziraat/Nestpay env değerleri yalnızca ilk kurulum/seed veya geriye dönük uyumluluk için tutulabilir.
- Store Key ve API şifresi WhatsApp, düz not veya commit içinde tutulmamalıdır.

Öneri:

- Şifreli parola yöneticisinde sakla.
- Sunucu dışında güvenli bir kopya tut.
- WhatsApp/normal notlar gibi yerlerde düz metin bırakma.

## Ödeme sistemi özel kontrol listesi

Canlı ödeme açılmadan önce:

- Aktif POS sağlayıcı doğru mu?
- `APP_URL` canlı domain mi?
- Ziraat callback URL'leri doğru domaine dönüyor mu?
- Başarılı ödeme dekont ekranına gidiyor mu?
- Başarısız ödeme başarısız detay ekranına gidiyor mu?
- Admin ödeme ekranında kayıt görünüyor mu?
- Temsilci sadece kendi işlemlerini görüyor mu?
- Finans yetkilisi tüm temsilci işlemlerini görebiliyor mu?
- Kartın yalnızca maskeli bilgisi tutuluyor mu?

## Rutin bakım

Haftalık:

```bash
pm2 status
sudo docker ps -a
df -h
```

Aylık:

- DB backup restore testi.
- Kullanıcı/temsilci listesi kontrolü.
- Eski veya pasif temsilcilerin devre dışı bırakılması.
- Admin şifresi ve erişim bilgilerinin gözden geçirilmesi.

## Kısa acil durum notları

Site açılmıyor:

```bash
pm2 status
pm2 logs katalog-site --lines 50
```

DB bağlantı hatası:

```bash
sudo docker ps -a
sudo docker start sqlserver
```

Docker permission hatası:

```bash
sudo docker ps -a
```

PM2 process yoksa:

```bash
pm2 list
pm2 resurrect
```

Yine yoksa proje klasöründe:

```bash
npm run build
pm2 start npm --name katalog-site -- start
pm2 save
```
