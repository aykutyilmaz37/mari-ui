# @mari-ui/tokens

[mari-ui](https://github.com/aykutyilmaz37/mari-ui) tasarım sisteminin tek token kaynağı: renk, boşluk, köşe, tipografi, gölge, katman ve hareket. Web (CSS değişkenleri) ve React Native (JS `Theme` objeleri) aynı kaynaktan beslenir. Açık ve koyu temanın her rengi **WCAG AA kontrastı hesaplanarak** türetilir. React'e ya da DOM'a bağımlı değildir; sunucuda, build adımında ve native'de çalışır.

```bash
pnpm add @mari-ui/tokens
```

`@mari-ui/components` ya da `@mari-ui/native` ile birlikte kurulur; çoğu projede doğrudan yalnızca tema ve kalıcılık fonksiyonları kullanılır.

## CSS

```css
@import "@mari-ui/tokens/theme.css";          /* --mari-* değişkenleri: :root açık, [data-theme="dark"] koyu */
@import "@mari-ui/tokens/tailwind-theme.css"; /* Tailwind v4 eşlemesi: bg-mari-primary-solid, rounded-md, shadow-mari-md… */
@import "@mari-ui/tokens/fonts.css";          /* isteğe bağlı: Geist, Manrope, Geist Mono (yerel dosyalar, ağ isteği yok) */
```

`@mari-ui/components`in CSS girişleri bunları zaten içerir; ayrıca import etmeniz gerekmez.

## Proje teması

Marka rengi, font, köşe/boşluk yoğunluğu, gölge, hareket ve **tasarım kişiliği** (`corporate`, `playful`, `minimal`, `editorial`, `luxury`) `mari-ui.config.json`dan gelir:

```json
{
  "persona": "editorial",
  "color": { "primary": "#0f766e" },
  "themes": {
    "marka": { "base": "light", "color": { "primary": "#a21caf" } },
    "yuksek-kontrast": { "base": "dark", "color": { "primary": "#facc15" } }
  }
}
```

```bash
npx @mari-ui/cli theme   # → mari-ui-theme.css + mari-ui-theme.ts
```

Kodda aynı çözümleme:

```ts
import { resolveThemeConfig } from "@mari-ui/tokens";

const { light, dark, themes } = resolveThemeConfig(config);
```

- Kişilik **taban** olur; yazdığınız her alan onu ezer.
- `themes` altındaki ek temalar `data-theme="<ad>"` ile seçilir. `base` kontrast yönüdür (açık ya da koyu zemin). Ek tema kendi rengini taşır, fontu ana temadan alır.
- Tek bir tema için: `createNamedTheme("marka", "light", { color: { primary: "#a21caf" } })`.

## Son kullanıcı tercihi (çalışma zamanı)

```ts
import { saveTheme, loadTheme, getThemeScript } from "@mari-ui/tokens";

saveTheme({ mode: "dark", spacing: "compact" });
```

`getThemeScript()`in döndürdüğü betiği `<head>`e satır içi koyun: kayıtlı tercih sayfa çizilmeden uygulanır, açılışta yanıp sönme olmaz. Arayüz için `@mari-ui/components/theme-customizer`.

## Kontrast yardımcıları

```ts
import { contrastRatio, meetsAA } from "@mari-ui/tokens";

contrastRatio("#6951ce", "#ffffff");
meetsAA("#6951ce", "#ffffff"); // metin için 4,5:1
```

## Fontlar

`fonts/` klasöründe Geist (gövde), Manrope (başlık) ve Geist Mono (kod) TTF dosyaları ve SIL Open Font License metinleri bulunur. Web'de `fonts.css`, React Native'de `require("@mari-ui/tokens/fonts/Geist.ttf")` ile yüklenir. Yüklenmezse sistem fontuna düşülür.

Lisans: MIT (fontlar SIL OFL 1.1).
