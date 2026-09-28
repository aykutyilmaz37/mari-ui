import type { ColorRole, Variant } from "../types/common";

/**
 * `@mari-ui/tokens`'taki `SemanticColorRole`nün hangi alanına (slot)
 * atıfta bulunulduğunu ifade eder. Somut bir renk değeri DEĞİL — "primary
 * rolünün solid tonu" gibi soyut bir referans. Bilinçli bir tasarım kararı:
 * bu paket JSX içermez, dolayısıyla bunu Tailwind class'ına çeviren
 * `@mari-ui/components`, `StyleSheet` objesine çeviren `@mari-ui/native`
 * olabilir. RN'de `hover:` yok, grid yok, shadow modeli farklı — bu yüzden
 * paylaşılan şey class string'i değil, bu token referansıdır.
 */
export interface ColorTokenRef {
  role: ColorRole;
  slot: "text" | "solid" | "solidContrast" | "solidHover" | "subtle" | "subtleContrast" | "border";
}

export interface ColorVariantStyle {
  background?: ColorTokenRef;
  foreground?: ColorTokenRef;
  border?: ColorTokenRef;
  hoverBackground?: ColorTokenRef;
}

function ref(role: ColorRole, slot: ColorTokenRef["slot"]): ColorTokenRef {
  return { role, slot };
}

/**
 * `color` + `variant` kombinasyonunu soyut bir stil tanımına çevirir.
 *
 * Bu fonksiyon var olmadan önce Button, Checkbox, Radio, Switch, Tooltip,
 * Dropdown, Modal'ın HER BİRİ kendi "filled/outlined" sözlüğünü elle
 * yazıyordu (bkz. `button/utils.ts`'teki `getVariantClasses`) — bu yüzden
 * "outlined" bazen `bg-white` bazen `border` demek, semantik renk bazen
 * `type` bazen `variant` bazen `color` oluyordu. Artık her renkli component
 * bunu çağırır; tutarlılık burada garanti edilir, 29 ayrı yerde değil.
 */
export function resolveColorVariant(color: ColorRole, variant: Variant): ColorVariantStyle {
  switch (variant) {
    case "solid":
      return {
        background: ref(color, "solid"),
        foreground: ref(color, "solidContrast"),
        hoverBackground: ref(color, "solidHover"),
      };
    case "outline":
      // Kenarlık, rolün AÇIK `border` tonu değil rengin KENDİSİ (`text` slot'u):
      // `-border` beyaz zeminde 1.8:1 kontrast veriyordu — WCAG 1.4.11 (UI
      // bileşen sınırı ≥ 3:1) ihlali, ve görsel olarak da "soluk ikinci renk"
      // gibi duruyordu (kullanıcı bulgusu). Rol rengiyle 5.9:1.
      // Hover/etkileşim BURAYA eklenmez: `Tag` gibi statik component'ler de
      // `outline` kullanıyor — etkileşim geri bildirimi Button'ın işi.
      return {
        foreground: ref(color, "text"),
        border: ref(color, "text"),
      };
    case "soft":
      return {
        background: ref(color, "subtle"),
        foreground: ref(color, "subtleContrast"),
      };
    // İkisi de bugün aynı stile çözülüyor (sadece metin rengi) — SonarJS'in
    // "duplicated branches" kuralı bunu haklı olarak yakaladı (Faz 8).
    // Ayrı case'lerde tutmak yerine fallthrough: gelecekte `link` (örn. alt
    // çizgi) farklılaşırsa buraya geri dönüp ayırmak, şu an iki kopya kod
    // bloğu taşımaktan daha doğru.
    case "ghost":
    case "link":
      return {
        foreground: ref(color, "text"),
      };
    default: {
      const _exhaustive: never = variant;
      throw new Error(`[@mari-ui/core] Bilinmeyen variant: ${_exhaustive}`);
    }
  }
}
