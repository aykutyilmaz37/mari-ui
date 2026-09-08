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

`Theme.mode` (`"light"|"dark"`) ve `Theme.name` (keyfi string) ayrı kavramlardır: `mode` SADECE WCAG kontrast aramasının yönünü belirler, `name` temanın GÖRÜNEN kimliğidir. `highContrast` teması `base: "dark"` olsa bile `name: "highContrast"` taşır — `mode`, `deriveColorRole`ün doğru yönde arama yapmasını garanti eder, `name` ise CSS seçicisini/native `ThemeProvider` tercihini belirler.

## Diğer paketler bunu nasıl kullanıyor

- **`@mari-ui/components`** (web): `dist/theme.css`/`dist/tailwind-theme.css`i import eder, `--mari-*` CSS değişkenleri üzerinden çalışır — çalışma zamanında bu pakete hiç bağımlı değildir.
- **`@mari-ui/core`**: `componentSize`/`resolveColorVariant` gibi platform-agnostic soyutlamalar için `spacing`/`radius` gibi primitifleri buradan alır.
- **`@mari-ui/native`**: `lightTheme`/`darkTheme`i (veya `createNamedTheme()`in ürettiği özel bir temayı) doğrudan JS objesi olarak tüketir — `ThemeProvider theme={...}` herhangi bir `Theme` şeklindeki objeyi kabul eder.
- **`@mari-ui/cli`**: `resolveThemeConfig()` ile `mari-ui.config.json`ı gerçek `Theme` objelerine çözer; `theme` komutu bunları CSS/TS dosyalarına yazar.
- **`apps/studio`** (Faz 6): `generateRamp()`/`resolveThemeConfig()` ile canlı önizleme — bugün sadece varsayılan light/dark çiftini düzenliyor, 3. tema ekleme UI'ı henüz yok (altyapı — bu paket + CLI — hazır, stüdyo arayüzü ileride eklenebilir).
