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

## Bilinen sınırlamalar (dürüstçe kayıtlı, gizlenmedi)

- **Radius yoğunluğu canlı önizlemede YANSIMAZ.** `@mari-ui/native`de `buildComponentSize(density)` ile gerçek zamanlı çalışıyor, ama web `@mari-ui/components`te her component'in radius'u Tailwind'de STATİK class olarak gömülü (`rounded-md` gibi — bkz. `packages/components/src/lib/sizeClasses.ts`'teki tasarım gerekçesi). Stüdyo bu seçimi config'e doğru kaydediyor, sadece önizleme panelinde göstermiyor. Gerçek bir düzeltme, component'lerin radius class'larını `rounded-[var(--mari-radius-md)]` gibi arbitrary-value'lara taşımayı gerektirir — bu, bu fazın kapsamı dışında bırakıldı.
- **Font ailesi bir CSS DEĞİŞKENİ olarak değil, `style.fontFamily` ile (düz CSS inheritance) önizleniyor** — bugün hiçbir component `--mari-font-sans`ı okumuyor (Tailwind `@theme inline` katmanı font ailesini eşlemiyor), bu yüzden CSS değişkeni geçmek görünürde hiçbir şey değiştirmezdi.
- **`mari-ui.config.json`ı gerçekten TÜKETEN bir CLI henüz yok** — `resolveThemeConfig()` bunun için hazır (Faz 7'nin `npx mari-ui theme`i aynı fonksiyonu çağıracak), ama bugün tüketici bu JSON'u indirdikten sonra elle bir yere bağlamıyor. Studio + CLI arasındaki bu boşluk Faz 7'de kapanacak.
- **Sadece `primary`/`accent` düzenlenebilir** (`success`/`error`/`warning`/`info`/`neutral` sabit) — `dist/schema.json`ın kendi `editable` sözleşmesiyle bilinçli olarak sınırlı tutuldu.

## Mimari notu

Stüdyonun kendi arayüzü (renk seçici paneli, tablo, vb.) bilinçli olarak Tailwind KULLANMIYOR — düz CSS (`app/globals.css`). Sadece ÖNİZLENEN component'ler (`PreviewPanel.tsx`) gerçek `@mari-ui/components`ten. Stüdyonun kendi görsel cilası bu fazın konusu değil (bkz. proje planı backlog madde 18 — component bazlı detaylı tasarım turu, ileride).
