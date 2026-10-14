# Mimari

mari-ui'ın paketleri, bir tasarım kararının (ör. marka rengi) token'dan ekrandaki piksele kadar izlediği yol ve bu yolu şekillendiren kararlar.

## Paketler ve bağımlılık yönü

```
            @mari-ui/tokens  ──────────────┐
                  │                         │
            @mari-ui/core                   │
             │          │                   │
  @mari-ui/components  @mari-ui/native      │
             │                              │
       manifest.json ──► @mari-ui/cli ◄─────┘
                                │
        apps/docs (Storybook)   apps/studio (tema stüdyosu)
```

| Paket | Sorumluluk | Bilinçli olarak YAPMADIĞI |
|---|---|---|
| `@mari-ui/tokens` | Renk rampaları, anlamsal roller (WCAG AA kontrastı hesaplanarak), boşluk/köşe/tipografi/gölge/katman/hareket skalaları; `mari-ui.config.json`ı çözümleme; CSS üretimi; tema kalıcılığı (`saveTheme`/`loadTheme`/`getThemeScript`). | React'e ya da DOM'a bağımlı değil — sunucuda, build adımında, native'de çalışır. |
| `@mari-ui/core` | Headless ortak mantık: `cn()`, `resolveColorVariant`, paylaşılan eksen tipleri (`ColorRole`, `Size`, `Variant`, `Radius`, `Placement`). | Render etmez. |
| `@mari-ui/components` | Web component'leri. Her klasör ayrı bir subpath (`@mari-ui/components/button`) ve ayrı bir derleme parçası. | Çalışma zamanında `@mari-ui/tokens`a bağlı değil; yalnız CSS değişkenlerini okur. |
| `@mari-ui/native` | React Native component'leri (`StyleSheet` + tokens JS objesi). | NativeWind / babel / metro eklentisi istemez. |
| `@mari-ui/cli` | `init` / `sync` / `theme`: tüketici projesine kurulum, tema dosyaları, AI ajan kuralları. | Paket yöneticisini kendisi çalıştırmaz, CSS import'u enjekte etmez. |
| `apps/docs` | Storybook — component dokümantasyonu ve "Başlarken" rehberleri. | |
| `apps/studio` | Next.js tema stüdyosu: renk/font/yoğunluk canlı düzenleme, kontrast paneli, `mari-ui.config.json` dışa aktarma. | |

`packages/modules/` yalnız klasör iskeleti (sayfa modülleri); backend sözleşmesi netleşene kadar kod yok.

## Token'dan piksele

1. **Kaynak** — `packages/tokens/src`: `primitives/` (rampalar, skalalar), `semantic/` (her rol için `text`, `solid`, `solidContrast`, `solidHover`, `subtle`, `subtleContrast`, `border`; açık ve koyu mod için ayrı, kontrast arayarak).
2. **CSS değişkenleri** — `cssVariables.ts` her token'ı `--mari-*` değişkenine çevirir (`--mari-color-primary-solid`, `--mari-radius-md`…). Build `dist/theme.css`i üretir: `:root` açık, `[data-theme="dark"]` koyu (+ `prefers-color-scheme` yedeği).
3. **Tailwind eşlemesi** — `dist/tailwind-theme.css`, `@theme inline` ile `--color-mari-*`, `--radius-*`, `--shadow-mari-*`, `--z-index-mari-*` utility'lerini bu değişkenlere bağlar. `bg-mari-primary-solid` → `var(--mari-color-primary-solid)`.
4. **Component CSS** — `packages/components/src/styles.css` bu eşlemeyi import edip Tailwind v4 ile derlenir → `dist/styles.css`. Tüketici yalnız bu dosyayı import eder; kendi projesinde Tailwind gerekmez.
5. **Tüketici teması** — `npx mari-ui theme`, `mari-ui.config.json`dan aynı fonksiyonlarla (`resolveThemeConfig`, `buildPlainThemeCss`) `mari-ui-theme.css` üretir; `styles.css`ten sonra import edilince değişkenleri ezer. Değişken üzerinden aktığı için component'ler yeniden derlenmez.

Renk, köşe ve boşluk yoğunluğu CSS değişkeni olduğundan **çalışma zamanında** değişebilir: `data-theme` (açık/koyu/ek temalar), `data-density` (Tailwind v4'ün `--spacing` tabanı), akışkan kök yazı boyutu (`scale.fluid`, 4K'de büyür). Son kullanıcı ayarları `ThemeCustomizer` + `saveTheme`/`loadTheme` ile saklanır; `getThemeScript()` sayfa çizilmeden önce çalışıp yanıp sönmeyi (FOUC) önler.

## Build

- `turbo run build` paketleri bağımlılık sırasıyla derler (`tokens → core → components/native → cli`).
- `@mari-ui/components`: `tsup` her `src/<klasör>/index.ts`i ayrı ESM girişi yapar (`scripts/discoverEntries.ts`). Tip bildirimleri tsup'ta değil tek bir `tsc` ile (`build:types`): ~90 girişte tsup'ın dts işçisi bellek yetersizliğiyle düşüyordu.
- `build:manifest` (`scripts/build-manifest.ts`, ts-morph) her girişin gerçek export'larını ve prop'larını (`@deprecated` dahil) `dist/manifest.json`a yazar.
- CI (`.github/workflows/ci.yml`): `pnpm turbo run build lint typecheck test` + `pnpm audit --audit-level critical`, Node 22.

## AI ajan kuralları

`@mari-ui/cli`, `manifest.json` + projenin çözümlenmiş teması + `src/skillGuide.ts`teki elle yazılı kararlardan tek bir içerik üretip beş araca yazar (Claude `SKILL.md`, `AGENTS.md`, `.cursor/rules`, `GEMINI.md`, Copilot). Kurallar elle tutulmaz: elle yazılan kural dosyası ilk sürümde eskir. Kısa "kesin kurallar" her dosyaya, uzun "sayfa kurma rehberi" yalnız Claude skill'ine girer. Rehberde adı geçen her component'in manifest'te var olduğunu bir test denetler.

## Temel kararlar

| Karar | Gerekçe |
|---|---|
| Renk CSS değişkeniyle, boyut Tailwind sınıfıyla | Renk çalışma zamanında değişir (tema, stüdyo); boyut skalası sabit bir ön ayardır. |
| Yapı ant.design'dan, görünüm mari-ui token'larından | Bilinen, olgun prop/davranış sözleşmesi; görsel kimlik bizim. |
| Link provider yok; düz `<a href>` + `onNavigate` | Router'dan bağımsız; tüketici `router.push`/`navigate` verir. |
| Native için NativeWind yok | Tüketiciye ek babel/metro kurulumu dayatmamak. |
| Grafikler saf SVG, paket bağımlılığı yok | Boyut, SSR uyumu, token'larla tam uyum. |
| Her component `skeleton` taşır | Yüklenince yerleşim kaymaz; iskelet component'in kendi geometrisinde. |
| Animasyonlar varsayılan açık, `motion-reduce` ile kapalı | Canlı his, erişilebilirlik tercihi her zaman kazanır. |
| Erişilebilirlik üç katman: jsx-a11y + axe testleri + Storybook a11y | Biri diğerinin yakalayamadığını yakalar ([ACCESSIBILITY.md](../ACCESSIBILITY.md)). |

## Yayın

Paketler `0.1.0` ve henüz npm'e yayınlanmadı; sürüm/yayın süreci (changesets vb.) kurulmadı.
