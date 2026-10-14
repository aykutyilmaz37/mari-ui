# mari-ui

<img src="assets/brand/mari-ui-logo.png" alt="mari-ui" width="320" />

Türkçe, token tabanlı, framework'ten bağımsız React tasarım sistemi. Web (React / Next.js, RSC uyumlu) ve React Native aynı token ve prop sözleşmesinden beslenir; renk, tipografi, boşluk tek kaynaktan (`@mari-ui/tokens`) türer, açık ve koyu tema WCAG AA kontrastıyla otomatik hesaplanır.

- **70+ component** — form, gezinme, veri gösterimi, grafikler, geri bildirim; her biri iskelet (`skeleton`), erişilebilirlik testi, açık/koyu tema ve mobil yerleşimle.
- **Tema** — `mari-ui.config.json` ile marka rengi, font, köşe ve boşluk yoğunluğu; tema stüdyosunda canlı düzenleme; son kullanıcı için `ThemeCustomizer`.
- **AI ajan kuralları** — `@mari-ui/cli`, kütüphanenin gerçek prop sözleşmesinden Claude Code, Codex, Cursor, Gemini ve Copilot için kural dosyaları üretir.

## Hızlı başlangıç

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

İkisini birden import etmeyin; `npx mari-ui init` projenize uygun olanı söyler. Tailwind v3 desteklenmez. Ayrıntılı kurulum (Next.js App Router, Vite, tema, koyu mod, AI kuralları) Storybook'taki **Başlarken** bölümünde.

## Paket grafiği

```
apps/
  docs/        Storybook — component ve kullanım dokümantasyonu
  studio/      Tema stüdyosu (Next.js) — renk/font/yoğunluk canlı düzenleme, mari-ui.config.json dışa aktarma
packages/
  tokens/      @mari-ui/tokens       platform-agnostic tek token kaynağı, tema çözümleme, tema kalıcılığı
  core/        @mari-ui/core         headless mantık: cn(), variant tabloları, paylaşılan eksen tipleri
  components/  @mari-ui/components   web component'leri (her biri ayrı subpath: @mari-ui/components/button)
  native/      @mari-ui/native       React Native component'leri (web ile aynı prop adları, ~45 component)
  cli/         @mari-ui/cli          init / sync / theme — tema üretimi ve AI ajan kuralları
  modules/     (iskelet)             sayfa modülleri — backend sözleşmesi netleşince
  (utils)                            UI'dan bağımsız yardımcılar (dataLayer, captcha) ayrı projeye taşındı
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

Paketler `0.1.0`; henüz npm'e yayınlanmadı ve bir sürüm/yayın süreci (changesets vb.) kurulmadı. CI her PR'da build, tip bilgili lint, tip kontrolü, eşikli coverage, story testleri (Playwright + axe) ve bağımlılık taramasını çalıştırır.
