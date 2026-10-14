# @mari-ui/tokens

mari-ui'ın platform-agnostic tek token kaynağı — renk, spacing, radius, typography, shadow, z-index, motion. Web (`dist/theme.css`/`dist/tailwind-theme.css`) ve native (saf JS `Theme` objeleri: `lightTheme`/`darkTheme`) AYNI kaynaktan (`src/theme.ts`) üretilir.

## 3. tema desteği (Faz 10)

`lightTheme`/`darkTheme` her zaman vardır ve varsayılandır. Bunun ÖTESİNDE, tüketici kendi projesinde keyfi sayıda ek isimli tema tanımlayıp AYNI `data-theme="..."` mekanizmasına ekleyebilir:

```ts
import { createNamedTheme } from "@mari-ui/tokens";

// `base`: WCAG kontrast aramasının hangi YÖNDE çalışacağı ("light" veya "dark").
// `name`in kendisi (CSS'te [data-theme="brand"] olarak çıkar) `base`ten TAMAMEN bağımsız.
const brandTheme = createNamedTheme("brand", "light", {
  color: { primary: "#a21caf" },
});
```

`@mari-ui/cli`nin (Faz 7) `theme` komutuyla, bunu elle kod yazmadan `mari-ui.config.json` üzerinden de tanımlayabilirsiniz:

```json
{
  "color": { "primary": "#2563eb", "accent": "#f97316" },
  "themes": {
    "brand": { "base": "light", "color": { "primary": "#a21caf" } },
    "highContrast": { "base": "dark", "color": { "primary": "#facc15" } }
  }
}
```

```bash
npx mari-ui theme
```

`mari-ui-theme.css`de her ek tema kendi `[data-theme="<isim>"]` bloğu olarak çıkar; `mari-ui-theme.ts`de `mariTheme.themes.<isim>` altında tam bir `Theme` objesi olarak bulunur (`@mari-ui/native`nin `<ThemeProvider theme={mariTheme.themes.brand}>`ı için hazır).

Ek tema **rengi** bağımsızdır (yazmadığı rol varsayılan rampayı kullanır); **fontu** üst seviyeden — kişilik dahil — miras alır, kendi `typography`si ezer. Koyu tabanlı ek temanın bloğuna `color-scheme: dark` da yazılır.

`Theme.mode` (`"light"|"dark"`) ve `Theme.name` (keyfi string) ayrı kavramlardır: `mode` SADECE WCAG kontrast aramasının yönünü belirler, `name` temanın GÖRÜNEN kimliğidir. `highContrast` teması `base: "dark"` olsa bile `name: "highContrast"` taşır — `mode`, `deriveColorRole`ün doğru yönde arama yapmasını garanti eder, `name` ise CSS seçicisini/native `ThemeProvider` tercihini belirler.

## Diğer paketler bunu nasıl kullanıyor

- **`@mari-ui/components`** (web): `dist/theme.css`/`dist/tailwind-theme.css`i import eder, `--mari-*` CSS değişkenleri üzerinden çalışır — çalışma zamanında bu pakete hiç bağımlı değildir.
- **`@mari-ui/core`**: `componentSize`/`resolveColorVariant` gibi platform-agnostic soyutlamalar için `spacing`/`radius` gibi primitifleri buradan alır.
- **`@mari-ui/native`**: `lightTheme`/`darkTheme`i (veya `createNamedTheme()`in ürettiği özel bir temayı) doğrudan JS objesi olarak tüketir — `ThemeProvider theme={...}` herhangi bir `Theme` şeklindeki objeyi kabul eder.
- **`@mari-ui/cli`**: `resolveThemeConfig()` ile `mari-ui.config.json`ı gerçek `Theme` objelerine çözer; `theme` komutu bunları CSS/TS dosyalarına yazar.
- **`apps/studio`** (Faz 6): `generateRamp()`/`resolveThemeConfig()` ile canlı önizleme — light/dark çiftinin yanında ek temalar da eklenip önizlenir ve `themes` alanına dışa aktarılır.

## Yumuşak iris ve fontlar

Varsayılan palet: açık modda `#6951CE`, koyu modda `#B7A5FF` birincil dolgu.
`solidContrast` her zaman dolgu ile birlikte kullanılmalıdır. `canvas.border`
dekoratif çizgiler; `canvas.input` görünür form sınırları; `canvas.ring` odak
halkası içindir. Açık ve koyu moddaki metin / hover çiftleri 4,5:1, kontrol
sınırları 3:1 eşikleriyle test edilir; bu tüm ürün için WCAG sertifikası değildir.

```tsx
import "@mari-ui/tokens/fonts.css"; // isteğe bağlı, yerel font dosyaları
import "@mari-ui/components/styles.css";
```

Geist gövde/UI, Manrope başlık, Geist Mono kod ailesidir. Fontlar otomatik ağ
isteği yapmaz. `fonts.css` yüklenmezse web sistem fontuna düşer. Font ve lisans
kaynakları `fonts/README.md` içindedir. CSS token değerleri somut aile
listeleridir; kendi değişkenlerine referans vermezler.

`defaultThemeConfig`, CLI ve stüdyo varsayılanlarının ortak kaynağıdır.
`fontFamilyHeading` ile başlık ailesi de özelleştirilebilir. İç içe açık/koyu
bölgeler `data-theme="light"` / `data-theme="dark"` ile kendi renk ve font
kapsamını kurar.
