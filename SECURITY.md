# Güvenlik — bağımlılık taraması (Faz 8)

Bu monorepo `pnpm audit`i CI'da (`.github/workflows/ci.yml`) her push/PR'da çalıştırır. Eşik **`critical`**te tutuluyor — bugün itibarıyla 0.

## Bilinen, kabul edilmiş risk

- **`image-size` (2 adet "high")** — `packages/native`'in `react-native > @react-native/community-cli-plugin > metro` zincirinden gelen transitif bir bağımlılık. **Yayınlanmış bir yaması yok** (advisory'nin kendisi "Patched versions: None" diyor). Sadece `react-native`in Metro CLI araç zincirinin (yerel geliştirme/build zamanı) bir parçası — `@mari-ui/native`i kuran hiçbir tüketiciye ŞİPLENMİYOR, kendi build çıktımızın içinde de yer almıyor. Yama çıkana kadar izlemeye devam edilecek; `pnpm audit` (eşiksiz) her zaman bunu gösterir, CI'ı KIRMAZ (eşik `critical`, bu ikisi `high`).

## Faz 8'de düzeltilenler (2026-09-08)

Bu fazdan önce 9 zafiyet vardı (1 kritik, 3 yüksek, 4 orta, 1 düşük):

| Zafiyet | Çözüm |
|---|---|
| **KRİTİK** — `vitest` <3.2.6 (UI sunucusu üzerinden keyfi dosya okuma/çalıştırma) | `vitest` tüm paketlerde `^2.1.8` → `^3.2.7`e yükseltildi |
| **YÜKSEK** — `vite` <=6.4.2 (`server.fs.deny` bypass) | `pnpm-workspace.yaml`da `overrides: vite >=6.4.3` |
| **YÜKSEK×2** — `image-size` (ICNS/JXL/HEIF DoS) | Yukarıda — kabul edilmiş risk, yama yok |
| **ORTA** — `uuid` <11.1.1 (buffer bounds) | `overrides: uuid >=11.1.1` |
| **ORTA** — `vite`/`launch-editor` (NTLMv2, Windows) | Yukarıdaki `vite` yükseltmesiyle birlikte çözüldü |
| **DÜŞÜK** — `esbuild` dev-server keyfi dosya okuma (Windows) | `overrides: esbuild >=0.28.1` |

## Nasıl çalıştırılır

```bash
pnpm audit              # tam rapor (bilgilendirme, CI'ı kırmaz)
pnpm run audit          # sadece critical eşiği (CI'ın kullandığı komut)
```

`pnpm-workspace.yaml`'daki `overrides` alanı, doğrudan seçmediğimiz ama transitif olarak (Storybook/tsup zincirinden) gelen paketlerin yamalı sürümlere zorlanmasını sağlar — bu paketleri biz `package.json`da seçmiyoruz, pnpm'in override mekanizması ağacın her yerinde bu sürümü dayatıyor.
