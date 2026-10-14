# @mari-ui/native-modules (henüz yok — sadece klasör iskeleti)

Cihaz özelliklerinin (kamera, konum, izinler, biyometri…) **UI kalıpları**. Henüz kod yok; bu klasörde `package.json` olmadığı için `pnpm-workspace.yaml` onu görmezden gelir.

## Kurallar (karar)

- `@mari-ui/native`'in üstüne kurulur; kendi stil sistemi yok.
- **Hiçbir native kütüphaneye bağlanmaz** (`expo-*`, vision-camera vb.). Asıl native iş consumer'ın verdiği adaptör fonksiyonlarıyla yapılır (ör. `<PermissionGate request={() => Camera.requestPermissionsAsync()} />`) — Upload'un `onPick` deseniyle aynı.
- Hazır adaptörler ileride isteğe bağlı alt yolda olabilir (ör. `@mari-ui/native-modules/expo`), ana pakete girmez.
- Yalnızca cihaz özelliklerinin UI kalıpları; login/sepet gibi sayfa modülleri burada değil (ayrıca konuşulacak).

## Modüller (ilk aday listesi)

`permission-gate` (izin durum ekranı), `scanner-overlay` (QR/barkod çerçevesi), `camera-capture` (çekim arayüzü), `location-picker` (adres formu + konumumu kullan), `biometric-lock` (kilit ekranı), `notification-prompt` (bildirim izni), `app-update` (güncelleme uyarısı), `offline-banner` (çevrimdışı bandı).
