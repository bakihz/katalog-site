# Ödeme Test Checklist

Bu checklist, sanal POS akışı temsilcilere açılmadan veya canlıya deploy edilmeden önce hızlı kontrol için hazırlanmıştır.

## Temsilci oturumu

- [ ] Temsilci kullanıcı adı/şifre ile giriş yapabiliyor.
- [ ] Pasif temsilci giriş yapamıyor.
- [ ] Ödeme sonrası temsilci oturumu korunuyor; kullanıcı login ekranına düşmüyor.
- [ ] Mobil tarayıcıda ödeme dönüşünden sonra oturum korunuyor.

## Başarılı ödeme

- [ ] Temsilci panelinden ödeme başlatılıyor.
- [ ] Banka 3D doğrulama ekranına hızlı yönleniyor.
- [ ] Doğrulama başarılı olunca dekont ekranına dönüyor.
- [ ] Dekontta müşteri, firma, açıklama, tutar, POS ve tarih doğru görünüyor.
- [ ] İşlem `İşlemlerim` ekranında refresh gerekmeden `Başarılı` görünüyor.
- [ ] Dashboard toplamları güncelleniyor.

## Başarısız ödeme

- [ ] Hatalı kart/iptal senaryosunda başarısız ödeme ekranına dönüyor.
- [ ] Bankadan gelen hata mesajı veya hata kodu ekranda görünüyor.
- [ ] İşlem `İşlemlerim` ekranında refresh gerekmeden `Başarısız` görünüyor.
- [ ] Başarısız işlem detay butonu doğru ekrana gidiyor.
- [ ] Başarısız işlem için dekont butonu görünmüyor.

## Callback güvenliği

- [ ] Aynı banka callback'i tekrar gelirse işlem çiftlenmiyor.
- [ ] Başarılı ödeme sonradan gelen fail callback ile `Başarısız` durumuna düşmüyor.
- [ ] Hash doğrulaması başarısızsa işlem güvenli şekilde reddediliyor.
- [ ] Sunucu loglarında sadece hata/warn logları kalıyor; debug logları canlıda kapalı.

## Mobil kontrol

- [ ] Android Chrome ödeme akışı çalışıyor.
- [ ] iPhone Safari/Chrome ödeme akışı çalışıyor.
- [ ] Banka uygulaması/3D doğrulama dönüşü doğru sayfaya geliyor.
- [ ] Klavye açıkken ödeme formunda taşma veya kullanılamayan alan kalmıyor.

## Deploy sonrası komutlar

DB şeması değiştiyse canlı sunucuda uygulama restart öncesi/sonrası şu adımlar kontrol edilmeli:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart katalog-site
```

> Not: `prisma db push`, `Payment` tablosuna hata kodu/mesajı alanlarını eklemek için gereklidir.
