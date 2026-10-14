# Güvenlik — bağımlılık taraması (Faz 8)

Bu monorepo `pnpm audit`i CI'da (`.github/workflows/ci.yml`) her push/PR'da çalıştırır. Eşik **`critical`**te tutuluyor — bugün itibarıyla 0.

## Bilinen, kabul edilmiş risk (2026-10-14 itibarıyla `pnpm audit`: 0 kritik)

Hepsi yalnız **geliştirme/build araçlarında**; yayınlanan `@mari-ui/*` paketlerinin içinde ya da bağımlılıklarında yok. `pnpm audit` (eşiksiz) bunları gösterir, CI'ı KIRMAZ (eşik `critical`).

| Paket | Seviye | Nereden | Neden kabul |
|---|---|---|---|
| `image-size` 1.2.1 | high ×2 | `react-native > metro` (asset bundler) | Yama 2.x'te, ama 2.x varsayılan dışa aktarımı ve dosya yoluyla okumayı kaldırdı — Metro bunları kullanıyor; zorlamak native-studio'nun görsel paketlemesini kırar. Yalnız kendi görsellerimizi işler. Metro 2.x'e geçince kalkar. |
| `node-forge` 1.4.0 | high | `apps/native-studio > expo` | Yayınlanmış yama yok (son sürüm etkilenen). Yalnız native-studio geliştirme uygulaması. |
| `braces` 3.0.3 | high | `@parcel/watcher`, `react-native` CLI | Yayınlanmış yama yok. Dosya izleme / CLI glob'ları, kullanıcı girdisi almaz. |
| `sprintf-js` 1.0.3 | moderate | `@storybook/test-runner > jest` | Yayınlanmış yama yok. Yalnız test koşucusu. |

2026-10-14'te düzeltilenler: `vitest` 3 → 4.1.11 (tinypool kritik ×2 + vitest/mocker), `next` 16.4.0 (stüdyo; kritik dahil 7 advisory), override'larla `shell-quote` (kritik), `brace-expansion` (1.x/2.x/5.x), `source-map-js`, `sharp` — 28 bulgu → 5.

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
