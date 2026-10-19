# mari-ui

<img src="assets/brand/mari-ui-logo.svg" alt="mari-ui" width="320" />

Türkçe, token tabanlı, framework'ten bağımsız React tasarım sistemi. Web (React / Next.js, RSC uyumlu) ve React Native aynı token ve prop sözleşmesinden beslenir; renk, tipografi, boşluk tek kaynaktan (`@mari-ui/tokens`) türer, açık ve koyu tema WCAG AA kontrastıyla otomatik hesaplanır.

- **70+ component** — form, gezinme, veri gösterimi, grafikler, geri bildirim; her biri iskelet (`skeleton`), erişilebilirlik testi, açık/koyu tema ve mobil yerleşimle.
- **Tema** — `mari-ui.config.json` ile marka rengi, font, köşe ve boşluk yoğunluğu; tema stüdyosunda canlı düzenleme; son kullanıcı için `ThemeCustomizer`.
- **AI ajan kuralları** — `@mari-ui/cli`, kütüphanenin gerçek prop sözleşmesinden Claude Code, Codex, Cursor, Gemini ve Copilot için kural dosyaları üretir.

## Paketler

| Paket | |
|---|---|
| [`@mari-ui/components`](https://www.npmjs.com/package/@mari-ui/components) | Web component'leri (React / Next.js, RSC uyumlu) |
| [`@mari-ui/native`](https://www.npmjs.com/package/@mari-ui/native) | React Native component'leri |
| [`@mari-ui/tokens`](https://www.npmjs.com/package/@mari-ui/tokens) | Token'lar, tema çözümleme, CSS |
| [`@mari-ui/core`](https://www.npmjs.com/package/@mari-ui/core) | Web ve native'in paylaştığı headless katman |
| [`@mari-ui/cli`](https://www.npmjs.com/package/@mari-ui/cli) | Kurulum, tema üretimi, AI ajan kuralları |

## Hızlı başlangıç (web)

```bash
npx @mari-ui/cli init
```

ya da elle:

```bash
pnpm add @mari-ui/components @mari-ui/core @mari-ui/tokens
```

```css
/* Global CSS — Tailwind v4 kullanıyorsanız: sınıfları kendi Tailwind'iniz derler, tekrar yok */
@import "tailwindcss";
@import "@mari-ui/components/tailwind.css";

/* Tailwind kullanmıyorsanız bunun yerine hazır derlenmiş CSS: */
/* @import "@mari-ui/components/styles.css"; */
```

```tsx
import { Button } from "@mari-ui/components/button";

<Button color="primary">Kaydet</Button>;
```

İkisini birden import etmeyin; `npx @mari-ui/cli init` projenize uygun olanı söyler. Tailwind v3 desteklenmez. Ayrıntılı kurulum (Next.js App Router, Vite, tema, koyu mod, AI kuralları) Storybook'taki **Başlarken** bölümünde.

## Hızlı başlangıç (React Native)

```bash
pnpm add @mari-ui/native @mari-ui/tokens react-native-svg
```

```tsx
import { Button } from "@mari-ui/native";

<Button color="primary" onPress={save}>Kaydet</Button>;
```

Tema cihazın açık/koyu ayarını izler; ayrıntılar [`@mari-ui/native`](packages/native/README.md).

## Paket grafiği

```
apps/
  docs/          Storybook — component ve kullanım dokümantasyonu (web + native)
  studio/        Tema stüdyosu (Next.js) — renk/kişilik/font/yoğunluk canlı düzenleme, mari-ui.config.json dışa aktarma
  native-studio/ Expo story tarayıcısı — native component'leri telefonda görmek için
packages/
  tokens/      @mari-ui/tokens       platform-agnostic tek token kaynağı, tema çözümleme, tema kalıcılığı
  core/        @mari-ui/core         headless mantık: cn(), variant tabloları, paylaşılan eksen tipleri
  components/  @mari-ui/components   web component'leri (her biri ayrı subpath: @mari-ui/components/button)
  native/      @mari-ui/native       React Native component'leri (web ile aynı prop adları, ~45 component)
  cli/         @mari-ui/cli          init / sync / theme — tema üretimi ve AI ajan kuralları
  modules/     (iskelet)             sayfa modülleri — ilk uygulamanın ihtiyacına göre
  native-modules/ (iskelet)          cihaz özelliklerinin UI kalıpları (izin, kamera, konum…)
  tsconfig/, eslint-config/          paylaşılan yapılandırma (yayınlanmaz)
```

Bağımlılık yönü tek yönlü: `tokens → core → {components, native}`; `cli` ve `studio` hepsini okur. Mimari ayrıntılar: [docs/architecture.md](docs/architecture.md).

## Geliştirme

```bash
pnpm install
pnpm build        # tüm paketler (turbo)
pnpm storybook    # http://localhost:6006
pnpm test
pnpm test:coverage                          # paket başına eşikli coverage (CI bunu koşar)
pnpm lint                                   # tip bilgili (sonarjs, jsx-a11y)
pnpm typecheck
pnpm -F @mari-ui/docs test-storybook:ci     # build sonrası: her story'de çizim + etkileşim + axe
```

Node ≥ 20, pnpm. Katkı süreci ve yeni component kontrol listesi: [CONTRIBUTING.md](CONTRIBUTING.md). Erişilebilirlik ve güvenlik: [ACCESSIBILITY.md](ACCESSIBILITY.md), [SECURITY.md](SECURITY.md).

## Durum

Paketler `0.x` (npm, public, MIT); sürüm ve yayın changesets ile — bkz. [CONTRIBUTING.md](CONTRIBUTING.md#sürüm-ve-yayın). CI her PR'da build, tip bilgili lint, tip kontrolü, eşikli coverage, story testleri (Playwright + axe) ve bağımlılık taramasını çalıştırır.
