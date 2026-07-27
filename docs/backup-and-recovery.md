# Yedekleme ve Kurtarma Rehberi

Bu belge, Lale EDT canlı altyapısındaki yedeklerin kapsamını, kontrol
yöntemlerini ve kurtarma önceliklerini açıklar.

> Güvenlik notu: Bu dosya repoda tutulabilecek şekilde sadeleştirilmiştir.
> İç IP adresleri, disk UUID'leri, SSH kullanıcıları, anahtar yolları,
> parolalar ve erişim bilgileri bu belgeye eklenmemelidir. Ayrıntılı altyapı
> envanteri yalnızca şirket içi, erişimi kısıtlı bir konumda tutulmalıdır.

## Yedekleme mimarisi

Canlı sistem iki sanal makineden oluşur:

- **WebServer:** Next.js uygulaması, PM2, SQL Server, Nginx Proxy Manager ve
  Portainer.
- **MailServer:** Mailcow e-posta sistemi.

Yerel yedekler Proxmox sunucusuna bağlı ayrı HDD altında saklanır. Bu disk
günlük operasyon hatalarına karşı koruma sağlar; ancak ana sunucuyla aynı
fiziksel cihazda bulunduğu için tek başına off-site veya bağımsız ikinci
kopya sayılmaz.

## Kesin yedek kapsamı

| Yedek türü | Kapsam | Hedef | Saklama |
| --- | --- | --- | --- |
| Günlük VM yedeği | WebServer ve MailServer sanal diskleri ile VM yapılandırmaları | `/mnt/yedekler/proxmox/dump` | Son 7 yedek |
| Haftalık kapalı VM yedeği | WebServer ve MailServer'ın stop mode tam yedeği | `/mnt/yedekler/proxmox/dump` | Son 4 haftalık |
| SQL Server yedeği | `KatalogSite` tam `.bak`, CHECKSUM, VERIFYONLY ve SHA-256 kontrolü | `/mnt/yedekler/web/sqlserver` | 14 gün |
| Kritik proje yedeği | Production `.env`, `public`, Prisma, paket/config dosyaları, PM2 kaydı ve ilgili compose dosyaları | `/mnt/yedekler/web/project` | Script politikası |
| Mailcow uygulama yedeği | Mailcow resmi `backup all` kapsamındaki posta, veritabanı ve yapılandırmalar | `/mnt/yedekler/mailcow` | 7 gün |
| Docker yapılandırma yedeği | Nginx Proxy Manager, Let's Encrypt, Portainer volume'ları, compose ve inspect bilgileri | `/mnt/yedekler/web/docker` | 56 gün |
| GitHub | Repoya gönderilmiş uygulama kaynak kodu | GitHub | Git geçmişi |

VM yedekleri ile uygulama seviyesindeki yedekler bazı verileri bilinçli
olarak tekrar eder. Böylece kurtarma işlemi yalnızca tek bir yönteme bağlı
kalmaz.

## Zamanlama

| Saat | Görev |
| ---: | --- |
| Her 4 saatte bir, 15. dakika | SQL Server yedeği |
| Her gün 01:00 | Snapshot VM yedeği |
| Her gün 03:30 | Kritik proje dosyaları |
| Her gün 04:00 | Mailcow uygulama yedeği |
| Her pazar 03:00 | Stop mode VM yedeği |
| Her pazar 05:30 | Docker/NPM/Portainer yedeği |

Mailcow görevinin önceki kaydı her gün 02:30'du. Bu saat, pazar günü 03:00
stop mode VM yedeğiyle çakışabileceği için onarım sırasında 04:00'a
taşınmıştır.

## Güncel durum — 27 Temmuz 2026

| Bileşen | Son gözlem | Durum |
| --- | --- | --- |
| Günlük VM yedeği | 27 Temmuz 01:00–01:12 | Başarılı |
| Haftalık stop mode VM yedeği | 26 Temmuz 03:00–03:12 | Başarılı |
| Kritik proje yedeği | 27 Temmuz 03:30 | Başarılı |
| SQL Server yedeği | 27 Temmuz 08:15; dört saatlik seri mevcut | Başarılı |
| Docker yapılandırma yedeği | 26 Temmuz 05:30 | Başarılı |
| Mailcow uygulama yedeği | 27 Temmuz 09:15 manuel doğrulama; yaklaşık 15 GB | Başarılı |

Mailcow yedeğinin 17 Temmuz sonrasında durmasının nedeni dosya adındaki
`malcow` yazım hatasıydı. Script
`/usr/local/sbin/mailcow-backup-to-proxmox.sh` olarak yeniden adlandırılmış,
sözdizimi doğrulanmış ve cron görevi `flock` çakışma korumasıyla her gün
04:00'a taşınmıştır. Manuel doğrulama sonucunda yaklaşık 15 GB arşiv
Proxmox'a aktarılmış; MariaDB, vmail, Redis, Rspamd, Postfix, crypt ve
`mailcow.conf` içerikleri görülmüş, MailServer'daki geçici arşiv başarılı
aktarımdan sonra temizlenmiştir.

## Yedekleri hızlı kontrol etme

Bu komut Proxmox ana makinesinde çalıştırılır ve hiçbir dosyayı değiştirmez:

```bash
for d in \
  /mnt/yedekler/proxmox \
  /mnt/yedekler/mailcow \
  /mnt/yedekler/web/project \
  /mnt/yedekler/web/sqlserver \
  /mnt/yedekler/web/docker
do
  echo
  echo "===== $d ====="
  find "$d" -maxdepth 4 -type f \
    -printf '%TY-%Tm-%Td %TH:%TM  %10s bayt  %p\n' 2>/dev/null \
    | sort -r \
    | head -n 5
done
```

Disk kullanımı:

```bash
du -sh \
  /mnt/yedekler/proxmox \
  /mnt/yedekler/mailcow \
  /mnt/yedekler/web/project \
  /mnt/yedekler/web/sqlserver \
  /mnt/yedekler/web/docker
```

Yedek diskinin gerçekten bağlı olduğunu kontrol et:

```bash
findmnt /mnt/yedekler
df -h /mnt/yedekler
```

Bir klasörde yeni tarihli dosya bulunması tek başına yeterli değildir.
Dosyanın makul boyutta olması, logun başarılı bitmesi ve periyodik restore
testi de kontrol edilmelidir.

## Bileşen bazında log kontrolü

WebServer:

```bash
sudo tail -n 100 /var/log/sqlserver-backup.log
sudo tail -n 100 /var/log/env-backup.log
sudo tail -n 100 /var/log/docker-config-backup.log
```

MailServer:

```bash
sudo tail -n 150 /var/log/mailcow-backup.log
sudo crontab -l
sudo systemctl status cron --no-pager
```

Proxmox VM görevleri arayüzde **Görevler** bölümünden veya yedek storage
içeriğinden kontrol edilmelidir. İlgili görevin `OK` olması beklenir.

## Doğrulanmış kurtarma seviyesi

- SQL Server `.bak` yedeği farklı bir test veritabanına restore edilmiştir.
- `RESTORE VERIFYONLY WITH CHECKSUM` ve `DBCC CHECKDB` başarılıdır.
- SQL Server kalıcı Docker volume üzerinde çalışmaktadır.
- VM ve uygulama arşivlerinin üretildiği doğrulanmıştır.

Henüz tamamlanmayan gerçek restore testleri:

- WebServer VM restore
- MailServer VM restore
- Mailcow temiz ortam restore
- Nginx Proxy Manager restore
- Portainer restore
- Kritik proje arşivinden production yeniden kurulum

## Doğrudan yedeklenmeyenler

- Proxmox host işletim sisteminin tam disk imajı
- Proxmox host yapılandırmasının bağımsız otomatik arşivi
- Yerel geliştirme bilgisayarı ve yerel geliştirme veritabanı
- GitHub'a gönderilmemiş kaynak kod değişiklikleri
- Ayrı fiziksel cihazdaki ikinci kopya
- Off-site veya sürekli takılı olmayan USB kopyası

Özellikle `/etc/pve`, ağ ve storage yapılandırmalarının bağımsız Proxmox
host yedeği sonraki yedekleme aşamasına eklenmelidir.

## Kritik güvenlik kuralları

- `.env`, SQL `.bak`, Mailcow, SSL ve VM yedekleri hassas veri içerir.
- Parolalar, private key içerikleri ve API anahtarları dokümana veya Git
  geçmişine yazılmaz.
- SQL Server'ın kalıcı volume'u silinmez.
- `docker volume prune` ve `docker system prune --volumes` kontrolsüz
  çalıştırılmaz.
- Yedek disk mount değilse scriptlerin boş mount klasörüne yazmasına izin
  verilmemelidir.
- Container silme/recreate işlemlerinden önce güncel SQL yedeği doğrulanır.
- Yedek dosyaları doğrudan kamuya açık bir konumda paylaşılmaz.

## Kurtarma öncelik sırası

1. Proxmox host, diskler ve yedek HDD kontrol edilir.
2. İlgili VM geri yüklenir veya mevcut VM açılır.
3. Docker ve kalıcı volume'lar kontrol edilir.
4. SQL Server ayağa kaldırılır ve `KatalogSite` durumu doğrulanır.
5. Next.js uygulaması PM2 ile başlatılır.
6. Nginx Proxy Manager ve domain yönlendirmesi kontrol edilir.
7. MailServer/Mailcow servisleri doğrulanır.
8. Admin, temsilci ve ödeme akışları test edilir.

## Sonraki aşamalar

- Yedek başarısızlıkları için otomatik bildirim kurmak
- Yedek diski doluluk ve mount kontrolü eklemek
- Proxmox host yapılandırmasını ayrıca yedeklemek
- Yeni SSD/ayrı cihaz geldiğinde ikinci fiziksel kopyayı kurmak
- Düzenli USB veya off-site kopya oluşturmak
- Eksik restore testlerini tamamlamak

Hedef, zaman içinde 3-2-1 yaklaşımına ulaşmaktır: en az üç veri kopyası,
iki farklı depolama ortamı ve fiziksel olarak farklı yerde bir kopya.
