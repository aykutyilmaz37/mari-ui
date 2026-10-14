# native-studio

`@mari-ui/native` component'lerini telefonda (Expo Go) görmek için story tarayıcısı. Story'ler `packages/native/src/**/*.stories.tsx` — web Storybook'taki "Native" bölümüyle aynı dosyalar.

## Başlatma

Repo kökünden:

```bash
pnpm native
```

Terminalde QR kod çıkar:

- **iPhone:** Kamera ile okut → Expo Go'da açılır.
- **Android:** Expo Go → "Scan QR code".

Telefon ve bilgisayar aynı Wi-Fi ağında olmalı. Tarayıcıda görmek için Expo terminalinde `w` tuşu.

> `expo start`ı **repo kökünde çalıştırmayın**: kökte Expo uygulaması yok; Expo varsayılan girişe (`node_modules/expo/AppEntry.js`) düşer ve `Unable to resolve "../../App"` hatası verir. `pnpm native` doğru klasörden başlatır.

## Nasıl çalışır

- `metro.config.js`: `@mari-ui/native` kaynaktan (`src`) çözülür — build gerekmez; React / React Native / react-native-svg tek kopya. Yollar paket adıyla (`require.resolve`), göreli değil.
- Story listesi: `@mari-ui/native/stories` (paketin `src/stories/registry.ts`'i, `require.context`).
- Üstteki seçiciler: açık/koyu tema ve tasarım kişiliği. Fontlar Geist / Manrope / Geist Mono (`@mari-ui/tokens/fonts`, `expo-font`).
