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
4. **Component CSS** — ortak kurallar `packages/components/src/mari.css`te (token eşlemesi `@mari-ui/tokens/tailwind.css` — `tailwindcss` import ETMEZ —, keyframes, base, yoğunluk, `duration-*`). İki giriş: **`tailwind.css`** (Tailwind v4'lü host; `mari.css` + derlenmiş `.js` taraması — host'un tek derlemesi sınıflarımızı da üretir, tekrar yok) ve **`styles.css`** (`@import "tailwindcss"` + `mari.css` → `dist/styles.css`, Tailwind'siz host'lar için hazır CSS). İkisi birlikte yüklenmez; CLI `init` host'un Tailwind sürümüne göre doğru olanı söyler.
5. **Tüketici teması** — `npx mari-ui theme`, `mari-ui.config.json`dan aynı fonksiyonlarla (`resolveThemeConfig`, `buildPlainThemeCss`) `mari-ui-theme.css` üretir; mari-ui CSS'inden (`tailwind.css` ya da `styles.css`) sonra import edilince değişkenleri ezer. Değişken üzerinden aktığı için component'ler yeniden derlenmez.

## Tasarım kişilikleri

Aynı component'lerle kurulan projeler birbirinin kopyası gibi görünmesin diye `@mari-ui/tokens` beş hazır kişilik taşır (`personas.ts`): **Kurumsal**, **Oyunbaz**, **Minimal**, **Editoryal**, **Lüks**. Kişilik yeni bir token ekseni değildir; `mari-ui.config.json`ın zaten anladığı alanların birlikte seçilmiş bir paketidir: renk, font eşleşmesi, köşe ve boşluk yoğunluğu, **gölge yoğunluğu** (`shadow`: none/soft/normal/strong) ve **hareket** (`motion` → `--mari-motion-scale`; `duration-*` ve varsayılan geçiş süresi bu çarpanla ölçeklenir).

- `config.persona` taban seçilir, config'te açıkça yazılan her alan onu ezer (`applyPersona`). Stüdyo dışa aktarırken yalnız kişilikten farklı alanları yazar (`minimizeConfig`).
- Fontlar yalnız aile adıdır; yüklemek tüketicinin işi. `npx mari-ui theme` kişiliğin Google Fonts bağlantısını basar (`personaFontsUrl`), CSS'e dış `@import` eklemez. React Native paketi font dosyası taşımaz (bilinçli karar): varsayılan sistem fontu; kişilik ailesini isteyen uygulama `expo-font` ile kendisi yükler (`fonts="brand"`). Her aile Türkçe glifler (ğ, İ, ş…) tarayıcıda ölçülerek seçildi.
- Aynı kaynak web ve native'i besler: web'de CSS değişkenleri, native'de `Theme.effects` (`shadowStyle`, `useMotionScale`).
- Seçim noktaları: Storybook araç çubuğundaki Kişilik seçici, `apps/studio`, native-studio'daki kişilik çipleri, `npx mari-ui init --persona <ad>` ve AI kurallarındaki "proje tasarım brief'i" adımı.

## Çalışma zamanı ayarları

Renk, köşe ve boşluk yoğunluğu CSS değişkeni olduğundan **çalışma zamanında** değişebilir: `data-theme` (açık/koyu/ek temalar), `data-density` (Tailwind v4'ün `--spacing` tabanı), akışkan kök yazı boyutu (`scale.fluid`, 4K'de büyür). Son kullanıcı ayarları `ThemeCustomizer` + `saveTheme`/`loadTheme` ile saklanır; `getThemeScript()` sayfa çizilmeden önce çalışıp yanıp sönmeyi (FOUC) önler.

## Build

- `turbo run build` paketleri bağımlılık sırasıyla derler (`tokens → core → components/native → cli`).
- `@mari-ui/components`: `tsup` her `src/<klasör>/index.ts`i ayrı ESM girişi yapar (`scripts/discoverEntries.ts`). Tip bildirimleri tsup'ta değil tek bir `tsc` ile (`build:types`): ~90 girişte tsup'ın dts işçisi bellek yetersizliğiyle düşüyordu.
- `build:manifest` (`scripts/build-manifest.ts`, ts-morph) her girişin gerçek export'larını ve prop'larını (`@deprecated` dahil) `dist/manifest.json`a yazar.
- CI (`.github/workflows/ci.yml`, Node 22): `pnpm turbo run build lint typecheck test:coverage`, ardından derlenmiş Storybook üzerinde story testleri (`test-storybook:ci`) ve `pnpm audit --audit-level critical`.

## Kalite kapıları

| Kapı | Ne yakalar |
|---|---|
| ESLint, **tip bilgili** (`projectService`) | `sonarjs` "Sonar way" kural setinin tamamı (tip isteyen 56 kural dahil), `jsx-a11y`, `react-hooks`. Kural kapatmaları VS Code'daki SonarQube for IDE ile eşlenir: kökteki `.vscode/settings.json` (`sonarlint.rules`). |
| Vitest + coverage (v8) | Paket başına eşik, bugünkü oranın ~1 puan altına kilitli (`vitest.config.ts`); oran düşerse CI kırılır, test eklendikçe elle yükseltilir. |
| Story testleri (`@storybook/test-runner`, Playwright) | Web + native, her story açılır: çizim / `play` hatası ve axe ihlali testi kırar (`apps/docs/.storybook/test-runner.ts`, azaltılmış hareketle). Native component'lerin çizimini bu katman kapsar (unit testleri yalnız saf yardımcılar). |
| `pnpm audit` | Kritik bağımlılık açıkları ([SECURITY.md](../SECURITY.md)). |

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
| Erişilebilirlik dört katman: jsx-a11y + axe unit testleri + Storybook a11y paneli + CI'da her story'de axe | Biri diğerinin yakalayamadığını yakalar ([ACCESSIBILITY.md](../ACCESSIBILITY.md)). |
| Component props `Readonly<…>` | Props içeride değiştirilmez; Sonar'ın `prefer-read-only-props` kuralı. |
| `@deprecated` takma ad yalnız yayından SONRA | Yayın öncesi eski adlar doğrudan kaldırılır (mergen-next geçişinden kalanlar 2026-10'da silindi). Yayından sonra bir ad değişirse JSDoc `@deprecated` + gerekçe yazılır; manifest bunu AI kurallarına "kullanmayın" listesi olarak taşır. |

## Yayın

Beş paket (`tokens`, `core`, `components`, `native`, `cli`) npm'de public ve MIT; `0.x` döneminde. Sürümleme [changesets](https://github.com/changesets/changesets) ile, beşi **birlikte** (`fixed`) — tasarım sisteminde paketler arası sürüm uyumsuzluğu olmasın. main'e gelen changeset'leri bir "sürüm paketleri" PR'ı toplar; merge edilince `release.yml` derleyip yayınlar (npm provenance). `workspace:*` bağımlılıkları yayında gerçek sürüme çevrilir. Akış: [CONTRIBUTING.md](../CONTRIBUTING.md#sürüm-ve-yayın).
