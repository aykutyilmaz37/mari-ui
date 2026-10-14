# @mari-ui/studio

mari-ui tema stüdyosu: marka renkleri, tasarım kişiliği, fontlar, köşe/boşluk yoğunluğu, gölge, hareket ve ek temalar **gerçek `@mari-ui/components` önizlemesiyle** düzenlenip `mari-ui.config.json` olarak dışa aktarılır (Next.js).

## Çalıştırma

```bash
pnpm --filter @mari-ui/studio dev
```

`http://localhost:3000`.

## Nasıl çalışıyor

1. Sol panelde seçilen `primary`/`accent` hex renkleri, `@mari-ui/tokens`'ın `generateRamp()`i ile tam bir 11 tonluk rampaya genişletilir.
2. `resolveThemeConfig()` bu rampaları `deriveColorRole`den geçirip WCAG AA'yı garanti eden `solid`/`subtle`/`text`/`border` tonlarını hesaplar — `@mari-ui/tokens`'ın kendi teması da aynı otomasyonla üretilir.
3. Sonuç `themeToCssVariables()` ile düz bir `--mari-color-*` haritasına çevrilip önizleme kapsayıcısına **inline `style`** olarak uygulanır. `@mari-ui/components`in derlenmiş Tailwind class'ları zaten bu CSS değişkenlerini okuduğu için (`bg-mari-primary-solid` → `var(--mari-color-primary-solid)`) hiçbir yeniden derleme gerekmeden GERÇEK component'ler anında güncellenir.
4. "mari-ui.config.json indir" butonu, şu an düzenlenen `MariUiThemeConfig`i (`@mari-ui/tokens`) bir dosya olarak indirir. Dosyanın şeması `@mari-ui/tokens/schema.json`.

## ThemeCustomizer ile ilişkisi

İki ayrı katman, aynı token çekirdeği (`@mari-ui/tokens`):

| | Tema Stüdyosu (bu uygulama) | `ThemeCustomizer` (`@mari-ui/components/theme-customizer`) |
|---|---|---|
| Kim | Geliştirici / tasarımcı | Tüketici uygulamanın son kullanıcısı |
| Ne zaman | Derleme zamanı → `mari-ui.config.json` → `npx @mari-ui/cli theme` | Çalışma zamanı → `applyTheme` |
| Ne | primary + accent, fontlar, radius, varsayılan boşluk yoğunluğu | mod, vurgu rengi (primary'nin yerine), boşluk yoğunluğu |
| Kontrast | Tablo gösterir, karar geliştiricide | Otomatik düzeltir (`buildAccentRole`: dolgu zemine ≥3:1) |

Soldaki **Varsayılan boşluk yoğunluğu** config'e `density.spacing` olarak yazılır; `npx @mari-ui/cli theme` onu `:root:not([data-density])` kuralı olarak üretir (Sıkı, dokunmatikte normale döner). Son kullanıcının ThemeCustomizer seçimi (`data-density`, "Normal" dahil) her zaman önceliklidir. ThemeCustomizer'ın varsayılan seçimi config'le aynı olsun diye: `defaultValue={{ spacing: mariTheme.spacingDensity, ...loadTheme() }}` (`mariTheme` → üretilen `mari-ui-theme.ts`).

**Büyük ekran** (`scale.fluid`, varsayılan kapalı): açıkken `npx @mari-ui/cli theme` `html { font-size: clamp(100%, …vw + …rem, max) }` üretir — kök yazı boyutu 1920px'e kadar tarayıcı varsayılanı, 3840px'te `scale.max` px (varsayılan 22). Her şey rem tabanlı olduğu için tüm arayüz orantılı büyür (22px'te 32px'lik düğme 44px olur). İşletim sistemi ölçeklemesi kapalı 4K ekranlar içindir; medya sorgusu kırılımları etkilenmez. Panel genişliğine bağlı olduğu için önizlemede görünmez.

**Ek temalar:** "Tema ekle" ile açık/koyunun yanına isimli temalar eklenir (ör. `marka`, `yuksek-kontrast`). Her birinin adı (`[data-theme="<ad>"]` seçicisi: küçük harf, rakam, tire; `light`/`dark` dışında, tekil), tabanı (açık/koyu — kontrast yönü ve `color-scheme`) ve kendi `primary`/`accent` rengi vardır; font ve yoğunluk ana temadan gelir. Geçerli adlı temalar config'in `themes` alanına yazılır ve üstteki seçiciden önizlenir; adı geçersiz tema alanında hata gösterir, config'e girmez.

Önizlemedeki **Sıkı / Normal / Rahat** geçişi, son kullanıcının seçebileceği yoğunluğu (`data-density` → Tailwind `--spacing`) bu temayla görmek içindir; config'e yazılmaz.

## Bilinen sınırlamalar

- **Radius yoğunluğu:** `density.radius` (`none`/`sm`/`md`/`lg`) `Theme.radius` skalasını orantılı ölçekler; web'de `--mari-radius-*` değişkenleri (Tailwind `rounded-sm/md/lg/xl` bunlara bağlı) değiştiği için önizlemede canlı yansır.
- **Sadece `primary`/`accent` düzenlenebilir** (`success`/`error`/`warning`/`info`/`neutral` sabit) — `dist/schema.json`ın kendi `editable` sözleşmesiyle bilinçli olarak sınırlı tutuldu.

## Mimari notu

Stüdyonun kontrolleri de mari-ui component'leridir; yerleşim düz CSS (`app/globals.css`). Önizleme (`PreviewPanel.tsx`) seçilen temanın CSS değişkenlerini inline uygular.

Varsayılan tema Yumuşak İris; Geist, Manrope ve Geist Mono yerel yüklenir. Gövde, başlık ve kod aileleri ayrı düzenlenebilir. Kontrast tablosu metin, hover, alan sınırı ve odağı kapsar.
