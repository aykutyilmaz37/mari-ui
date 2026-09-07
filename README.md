# mari-ui

Yayınlanabilir bir tasarım sistemi ve component kütüphanesi monorepo'su. Web (React / Next.js, RSC uyumlu) ve React Native'i aynı token ve prop sözleşmesinden besler.

## Paket grafiği

```
apps/
  docs/        Storybook — tek dokümantasyon yüzeyi
  studio/      Tema stüdyosu (Next.js) — henüz kurulmadı (Faz 6)
packages/
  tokens/      @mari-ui/tokens        platform-agnostic tek kaynak
  core/        @mari-ui/core          headless logic, tipler, variant tabloları
  components/  @mari-ui/components    web / RSC uyumlu bileşenler
  native/      @mari-ui/native        React Native bileşenleri (pilot)
  cli/         @mari-ui/cli           tema üretimi + AI ajan kuralları
  tsconfig/    @mari-ui/tsconfig      paylaşılan TypeScript taban config'i
  eslint-config/                      paylaşılan ESLint taban config'i
```

Bağımlılık yönü tek yönlü: `tokens → core → {components, native}`.

## Geliştirme

```bash
pnpm install
pnpm dev
pnpm build
pnpm storybook
```

## Durum

Refactor planı: `mergen-next` → `mari-ui` monorepo dönüşümü sürüyor. İlerleme fazları için proje geçmişindeki commit'lere bakın.
