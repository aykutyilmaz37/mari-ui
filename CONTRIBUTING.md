# Katkı rehberi

Bu repo bir pnpm + Turborepo monorepo'su. Paketlerin ne yaptığı ve birbirine nasıl bağlandığı için önce [docs/architecture.md](docs/architecture.md).

## Ortam

- Node ≥ 20 (CI Node 22 LTS kullanır), pnpm (`packageManager` alanındaki sürüm).
- `pnpm install` — tüm workspace bağımlılıkları.
- `pnpm build` — tüm paketler. Storybook ve stüdyo diğer paketlerin **derlenmiş** `dist/` çıktısını okur; ilk açılıştan önce bir kez build gerekir.

| Komut | Ne yapar |
|---|---|
| `pnpm storybook` | Storybook (`apps/docs`, :6006) |
| `pnpm --filter @mari-ui/studio dev` | Tema stüdyosu (:3000) |
| `pnpm test` / `pnpm lint` / `pnpm typecheck` | Tüm paketlerde vitest / ESLint / tsc |
| `pnpm --filter @mari-ui/components build:css` | Yalnız component CSS'i (`dist/styles.css`) |
| `pnpm --filter @mari-ui/components dev` | JS + CSS izleme modu |

**Storybook'ta yeni bir Tailwind sınıfı görünmüyorsa:** Storybook CSS'i `@mari-ui/components/dist/styles.css`ten okur. Ya `dev` izleme modunu açık tutun ya da `build:css` çalıştırın.

## Dal ve commit düzeni

- Her iş kendi dalında, güncel `main`den açılır: `faz/<kısa-ad>` (ör. `faz/splitter`, `faz/14-dokumantasyon`).
- Commit mesajı: `tür(kapsam): Türkçe özet` — `feat(splitter): …`, `fix(chart): …`, `docs(storybook): …`. Gövdede *ne* ve *neden*; maddeler halinde.
- PR `main`e açılır; CI (build, lint, typecheck, test, `pnpm audit`) yeşil olmalı.

## Yeni component kontrol listesi

Yapı ant.design'dan alınır (prop adları, davranış); görünüm her zaman mari-ui token'larından gelir. Her yeni component **doğuştan** aşağıdakilerin hepsini karşılar.

### Dosyalar

```
packages/components/src/<ad>/
  <Ad>.tsx            component ("use client" yalnız hook/tarayıcı API'si varsa)
  types.ts            prop tipleri — her prop'ta JSDoc (Türkçe; varsayılanı yazın)
  utils.ts            saf yardımcılar (DOM'suz, ayrıca test edilir) — gerekiyorsa
  index.ts            dışa açılanlar (component + tipler)
  <Ad>.stories.tsx
  <Ad>.test.tsx       (+ utils.test.ts)
  _components/        yalnız bu component'in alt parçaları — gerekiyorsa
```

- `src/` altında `index.ts`i olan her klasör otomatik olarak ayrı bir build girişi olur (`scripts/discoverEntries.ts`). **Elle yapılacak tek kayıt:** `packages/components/package.json` → `exports` altına `"./<ad>"` girdisi (types + import), diğerleriyle aynı biçimde.
- Paylaşılan parçalar `src/lib/` altında (`sizeClasses`, `colorClasses`, `elevationClass`, `skeleton`, `linkBehavior`, `useAnimatedValue`…) — aynı işi yeniden yazmadan önce oraya bakın.

### Tasarım ve token'lar

- Genel tasarım yönü: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) temel alınır; erişilebilirlik, açıklık, platform alışkanlıkları ve tutarlı geri bildirim tasarıma baştan katılır. [Material Design 3](https://m3.material.io/) renk rolleri, tipografi hiyerarşisi, uyarlanabilir düzen ve etkileşim durumları için ilham kaynağıdır. Rehberler mari-ui token ve API'lerine uyarlanır; her platform kendi ölçü ölçeğini ve yerleşik davranışlarını izler.
- Sabit renk (hex, `bg-white`), sabit px boşluk/köşe, skala dışı gölge veya `z-[999]` yok. Renk `mari-*` sınıflarıyla (`bg-mari-surface`, `text-mari-muted`, `border-mari-border`; rol renkleri `colorClasses` tablolarından), boyut `sizeClass` ile, yükselti `elevationClass` ile.
- Paylaşılan eksenler `@mari-ui/core`dan: `color` (`ColorRole`), `variant`, `size`, `shape`, `placement` — yeni bir eksen icat etmeden önce bunlara bakın.
- Dokunma hedefi: küçük kontrollerde `touchTargetClass` / `touchTargetSquareClass` (görünümü değiştirmeden 44px).
- 375px, 768px ve masaüstünde, açık ve koyu temada denenmiş olmalı; 375px'te yatay kaydırma olmamalı.
- Hareket: `motion-reduce:` ile hareket azaltma tercihine uyulur.

### Yüklenme ve boş hal

- `skeleton` prop'u (`SkeletonableProps`): veri gelene kadar component **kendi geometrisinde** yer tutucu çizer — yüklenince yerleşim kaymaz. Yer tutucu ekran okuyucudan gizlidir (`skeletonBoxProps`, `skeletonFill`).
- `loading` ≠ `skeleton`: `loading` süren bir **eylem**dir (Button spinner'ı), `skeleton` henüz **veri yok** demektir.
- Liste/tablo/grafik gibi veri gösteren component'lerde boş hal (`Empty` ya da grafiklerdeki bulanık iskelet deseni).

### Erişilebilirlik

[ACCESSIBILITY.md](ACCESSIBILITY.md)deki kontrol listesi: doğru rol, klavyeyle her şey, odak yönetimi (overlay açılınca içeri, kapanınca tetikleyene; gizli içerik `inert`), axe testi. `getA11yViolations(container)` (`src/testUtils/a11y.ts`) ile en az varsayılan ve en karmaşık gerçek kullanım test edilir.

### Bağlantılar

Link provider yok: bağlantılar düz `<a href>`; SPA geçişi tüketicinin verdiği `onNavigate` ile (`lib/linkBehavior`). `target="_blank"` ve dış adresler router'ı atlar.

### Storybook

- Başlık kategorisi: `Genel/`, `Navigasyon/`, `Veri Girişi/`, `Veri Gösterimi/`, `Geri Bildirim/` (grafikler `Veri Gösterimi/Charts/`).
- `meta.parameters.docs.description.component = componentDoc({ summary, whenToUse, whenNotToUse, a11y })`.
- Her story `...storyDoc("açıklama", \`kullanım kodu\`)` taşır — ikinci argüman "Show code"da görünen kod. Story seviyesinde `parameters` **yazmayın** (`storyDoc`'u ezer).
- Story'ler gerçek senaryodur (e-posta istemcisi, sipariş tablosu…), "Örnek 1" değil. Bir `Playground` + senaryolar.
- `İskelet` story'si ortak `SkeletonDemo` ile (İskelet / Yüklendi geçişi); animasyonlu component'lerde `AnimationDemo` ("Tekrar oynat").
- Metinler Türkçe.

### Kalite kapısı

```bash
pnpm --filter @mari-ui/components exec tsc --noEmit -p .
pnpm --filter @mari-ui/components exec eslint src/<ad>
pnpm --filter @mari-ui/components exec vitest run src/<ad>
```

- ESLint **tip bilgili** çalışır: `sonarjs`in tip isteyen kuralları da (ör. `prefer-read-only-props`, `deprecation`) etkin. Component props'ları `Readonly<…>` yazılır.
- `sonarjs` bilişsel karmaşıklık sınırı 15: aşan render'ı alt bileşenlere / saf yardımcılara bölün. `eslint-disable` yalnız gerekçesiyle (`-- neden`).
- Bir `sonarjs` kuralını kapatırsanız (`packages/eslint-config/base.mjs`), aynı kuralı Sonar anahtarıyla kökteki `.vscode/settings.json`da (`sonarlint.rules`) da kapatın — VS Code'daki SonarQube for IDE ile CLI aynı şeyi göstersin.
- Coverage eşikleri paket başına `vitest.config.ts`te (bugünkü oranın ~1 puan altı). Test eklediğinizde oran yükseldiyse eşiği de yükseltin.
- Yeni / değişen story'ler CI'da Playwright'ta açılır ve axe'tan geçer: `pnpm build` sonrası `pnpm -F @mari-ui/docs test-storybook:ci` (tek dosya: `… test-storybook --url … <ad>`).
- Paket yayınlanana kadar eski prop adları için `@deprecated` takma ad tutulmaz; ad değişirse kullanım yerleri de değiştirilir.
- Davranışı Storybook'ta gerçek tarayıcıda da deneyin (fare, klavye, dar ekran).

### Değişiklik başka yerleri etkiliyorsa

- AI kural rehberi (`packages/cli/src/skillGuide.ts`): yeni component bir sayfa kalıbının parçasıysa rehbere bir satır; adı geçen her component gerçek manifest'te var olmalı (test denetler).
- Token ekleme/değiştirme: `packages/tokens` → CSS değişkeni (`cssVariables.ts`) + Tailwind teması (`cssOutput.ts`) + gerekiyorsa şema.
- Storybook "Genel Bakış" sayfası (`packages/components/src/Overview.mdx`): `SECTIONS` listesine yeni component için bir satır. Doküman sayfası adresleri `--doküman` ile biter (doküman sekmesinin adı Türkçe), `--docs` değil.

## Sürüm ve yayın

Yayınlanan paketler: `@mari-ui/tokens`, `core`, `components`, `native`, `cli` (npm, public, MIT). Beşi birlikte sürümlenir.

1. Kullanıcıyı etkileyen bir değişiklikte PR'a changeset ekleyin: `pnpm changeset` (`0.x` döneminde kırıcı değişiklik `minor`, geri kalan `patch`). Yalnız doküman/test/iç araç değişikliği changeset istemez.
2. main'e birleşince `.github/workflows/release.yml` bir **"chore: sürüm paketleri"** PR'ı açar ya da günceller (sürüm + `CHANGELOG.md`).
3. O PR merge edilince paketler npm'e yayınlanır (provenance imzalı).

İlk kurulum (bir kez, repo sahibi): npm'de `mari-ui` organizasyonu, GitHub'da `NPM_TOKEN` secret'ı (npm "Automation" token), repo değişkeni `RELEASE_ENABLED=true`; provenance için repo public olmalı.
