# @mari-ui/native-modules (henüz yok — sadece klasör iskeleti)

Cihaz özelliklerinin (kamera, konum, izinler, biyometri…) **UI kalıpları**. Kapsam unutulmasın diye `.gitkeep` ile açıldı (kullanıcı kararı, 2026-10-11) — hiçbir kod, `package.json` veya build altyapısı YOK; `pnpm-workspace.yaml` bu dizini görmezden gelir.

## Kurallar (karar)

- `@mari-ui/native`'in üstüne kurulur; kendi stil sistemi yok.
- **Hiçbir native kütüphaneye bağlanmaz** (`expo-*`, vision-camera vb.). Asıl native iş consumer'ın verdiği adaptör fonksiyonlarıyla yapılır (ör. `<PermissionGate request={() => Camera.requestPermissionsAsync()} />`) — Upload'un `onPick` deseniyle aynı.
- Hazır adaptörler ileride isteğe bağlı alt yolda olabilir (ör. `@mari-ui/native-modules/expo`), ana pakete girmez.
- Yalnızca cihaz özelliklerinin UI kalıpları; login/sepet gibi sayfa modülleri burada değil (ayrıca konuşulacak).
- Zamanlama: native Dalga 4–8 bittikten sonra.

## Modüller (ilk aday listesi)

`permission-gate` (izin durum ekranı), `scanner-overlay` (QR/barkod çerçevesi), `camera-capture` (çekim arayüzü), `location-picker` (adres formu + konumumu kullan), `biometric-lock` (kilit ekranı), `notification-prompt` (bildirim izni), `app-update` (güncelleme uyarısı), `offline-banner` (çevrimdışı bandı).
