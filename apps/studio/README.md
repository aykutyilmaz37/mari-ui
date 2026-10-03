# @mari-ui/studio

Faz 6 — mari-ui tema stüdyosu. Tüketicinin `primary`/`accent` marka renklerini, font ailesini ve radius yoğunluğunu **gerçek `@mari-ui/components` önizlemesiyle** düzenleyip `mari-ui.config.json` olarak dışa aktardığı Next.js uygulaması.

## Çalıştırma

```bash
pnpm --filter @mari-ui/studio dev
```

`http://localhost:3000`.

## Nasıl çalışıyor

1. Sol panelde seçilen `primary`/`accent` hex renkleri, `@mari-ui/tokens`'ın `generateRamp()`i ile tam bir 11 tonluk rampaya genişletilir.
2. `resolveThemeConfig()` bu rampaları `deriveColorRole`den geçirip WCAG AA'yı garanti eden `solid`/`subtle`/`text`/`border` tonlarını hesaplar — bu, `@mari-ui/tokens`'ın Faz 1'den beri var olan otomasyonunun AYNISI, sadece artık keyfi bir anchor renk için de çalışıyor.
3. Sonuç `themeToCssVariables()` ile düz bir `--mari-color-*` haritasına çevrilip önizleme kapsayıcısına **inline `style`** olarak uygulanır. `@mari-ui/components`in derlenmiş Tailwind class'ları zaten bu CSS değişkenlerini okuduğu için (`bg-mari-primary-solid` → `var(--mari-color-primary-solid)`) hiçbir yeniden derleme gerekmeden GERÇEK component'ler anında güncellenir.
4. "mari-ui.config.json indir" butonu, şu an düzenlenen `MariUiThemeConfig`i (`@mari-ui/tokens`) bir dosya olarak indirir. Bu dosyanın şeması `@mari-ui/tokens`'ın `dist/schema.json`'ıyla (Faz 1'de bu fazı öngörerek önceden üretilmişti) birebir örtüşür.

## ThemeCustomizer ile ilişkisi (Faz 16.8)

İki ayrı katman, aynı token çekirdeği (`@mari-ui/tokens`):

| | Tema Stüdyosu (bu uygulama) | `ThemeCustomizer` (`@mari-ui/components/theme-customizer`) |
|---|---|---|
| Kim | Geliştirici / tasarımcı | Tüketici uygulamanın son kullanıcısı |
| Ne zaman | Derleme zamanı → `mari-ui.config.json` → `npx mari-ui theme` | Çalışma zamanı → `applyTheme` |
| Ne | primary + accent, fontlar, radius, varsayılan boşluk yoğunluğu | mod, vurgu rengi (primary'nin yerine), boşluk yoğunluğu |
| Kontrast | Tablo gösterir, karar geliştiricide | Otomatik düzeltir (`buildAccentRole`: dolgu zemine ≥3:1) |

Soldaki **Varsayılan boşluk yoğunluğu** config'e `density.spacing` olarak yazılır; `npx mari-ui theme` onu `:root:not([data-density])` kuralı olarak üretir (Sıkı, dokunmatikte normale döner). Son kullanıcının ThemeCustomizer seçimi (`data-density`, "Normal" dahil) her zaman önceliklidir. ThemeCustomizer'ın varsayılan seçimi config'le aynı olsun diye: `defaultValue={{ spacing: mariTheme.spacingDensity, ...loadTheme() }}` (`mariTheme` → üretilen `mari-ui-theme.ts`).

Önizlemedeki **Sıkı / Normal / Rahat** geçişi, son kullanıcının seçebileceği yoğunluğu (`data-density` → Tailwind `--spacing`) bu temayla görmek içindir; config'e yazılmaz.

## Bilinen sınırlamalar (dürüstçe kayıtlı, gizlenmedi)

- **Radius yoğunluğu** (Faz 15): `density.radius` (`none`/`sm`/`md`/`lg`) `Theme.radius` skalasını orantılı ölçekler; web'de `--mari-radius-*` değişkenleri (Tailwind `rounded-sm/md/lg/xl` bunlara bağlı) değiştiği için önizlemede canlı yansır.
- **`mari-ui.config.json`ı gerçekten TÜKETEN bir CLI henüz yok** — `resolveThemeConfig()` bunun için hazır (Faz 7'nin `npx mari-ui theme`i aynı fonksiyonu çağıracak), ama bugün tüketici bu JSON'u indirdikten sonra elle bir yere bağlamıyor. Studio + CLI arasındaki bu boşluk Faz 7'de kapanacak.
- **Sadece `primary`/`accent` düzenlenebilir** (`success`/`error`/`warning`/`info`/`neutral` sabit) — `dist/schema.json`ın kendi `editable` sözleşmesiyle bilinçli olarak sınırlı tutuldu.

## Mimari notu

Stüdyonun kendi arayüzü (renk seçici paneli, tablo, vb.) bilinçli olarak Tailwind KULLANMIYOR — düz CSS (`app/globals.css`). Sadece ÖNİZLENEN component'ler (`PreviewPanel.tsx`) gerçek `@mari-ui/components`ten. Stüdyonun kendi görsel cilası bu fazın konusu değil (bkz. proje planı backlog madde 18 — component bazlı detaylı tasarım turu, ileride).

Varsayılan tema Yumuşak İris; Geist, Manrope ve Geist Mono yerel yüklenir. Gövde, başlık ve kod aileleri ayrı düzenlenebilir. Kontrast tablosu metin, hover, alan sınırı ve odağı kapsar.
