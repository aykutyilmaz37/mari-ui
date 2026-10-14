import { fontSize, radius, spacing, type RadiusScale } from "@mari-ui/tokens";
import type { ExtendedSize } from "../types/common";

export interface ComponentSizeTokens {
  /** Etkileşimli bir kontrolün (buton, input) toplam yüksekliği. */
  height: string;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  /** İkon/metin arası boşluk. */
  gap: string;
  radius: string;
}

/**
 * `RADIUS_KEYS`, `@mari-ui/tokens`'ın `radius` skalasının (none→full) sıralı
 * anahtar listesi. `buildComponentSize`'ın "yoğunluk kaydırma" mantığı bu
 * sıralamaya göre çalışır — `radius.ts`taki gerçek object literal sırasıyla
 * senkron tutulmalı (bir test bunu doğruluyor, bkz. `sizeScale.test.ts`).
 */
const RADIUS_KEYS: RadiusScale[] = ["none", "sm", "md", "lg", "xl", "full"];
const DEFAULT_DENSITY: RadiusScale = "md";

/** Her boyutun VARSAYILAN (density="md") radius'unun hangi skala anahtarına karşılık geldiği. */
const BASE_RADIUS_KEY: Record<ExtendedSize, RadiusScale> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "md",
  xl: "lg",
};

function shiftRadiusKey(key: RadiusScale, offset: number): RadiusScale {
  const index = RADIUS_KEYS.indexOf(key);
  const shifted = Math.min(Math.max(index + offset, 0), RADIUS_KEYS.length - 1);
  return RADIUS_KEYS[shifted] as RadiusScale;
}

/**
 * Paylaşılan boyut skalası. Öncesinde `ButtonSize`, `InputSize`,
 * `DividerSize`, `SwitchSize`, `RangeSize` aynı `large|middle|small` union'ını
 * 6 kez tekrar ediyordu; Modal `small|medium|large`, Drawer `sm|md|lg`,
 * Skeleton `small|default|large` gibi FARKLI sözlükler kullanıyordu. Artık
 * `sm|md|lg` (gerekirse `xs`/`xl`) tek skala, ve her boyutun somut
 * height/padding/fontSize değeri buradan, `@mari-ui/tokens`'tan gelir —
 * component'ler kendi `getSizeClasses` sözlüğünü elle yazmaz.
 *
 * `radiusDensity`:
 * `"md"` (varsayılan) her boyutun `BASE_RADIUS_KEY`'ini olduğu gibi kullanır.
 * Başka bir değer, "md"e göre skala üzerindeki OFFSET'i her boyuta uygular —
 * yani `"sm"` seçilirse her boyut bir adım keskinleşir, `"full"` seçilirse
 * her şey hap/daire olur. Tek bir sabit radius'a sabitlemek yerine offset
 * kullanmanın sebebi: `xs`/`xl` gibi uçlardaki boyutların birbirine göre
 * ORANTISI (küçük buton her zaman büyük butondan biraz daha keskin köşeli)
 * yoğunluk değişince de korunsun.
 */
export function buildComponentSize(radiusDensity: RadiusScale = DEFAULT_DENSITY): Record<ExtendedSize, ComponentSizeTokens> {
  const offset = RADIUS_KEYS.indexOf(radiusDensity) - RADIUS_KEYS.indexOf(DEFAULT_DENSITY);
  const radiusFor = (size: ExtendedSize) => radius[shiftRadiusKey(BASE_RADIUS_KEY[size], offset)];

  return {
    xs: {
      height: spacing[5],
      paddingX: spacing[2],
      paddingY: spacing[0.5],
      fontSize: fontSize.xs,
      gap: spacing[1],
      radius: radiusFor("xs"),
    },
    sm: {
      height: spacing[6],
      paddingX: spacing[2],
      paddingY: spacing[1],
      fontSize: fontSize.xs,
      gap: spacing[1.5],
      radius: radiusFor("sm"),
    },
    md: {
      height: spacing[8],
      paddingX: spacing[3],
      paddingY: spacing[1.5],
      fontSize: fontSize.sm,
      gap: spacing[2],
      radius: radiusFor("md"),
    },
    lg: {
      height: spacing[10],
      paddingX: spacing[4],
      paddingY: spacing[2],
      fontSize: fontSize.md,
      gap: spacing[2],
      radius: radiusFor("lg"),
    },
    xl: {
      height: spacing[12],
      paddingX: spacing[5],
      paddingY: spacing[2.5],
      fontSize: fontSize.lg,
      gap: spacing[2.5],
      radius: radiusFor("xl"),
    },
  };
}

/** Varsayılan yoğunluk (`"md"`) ile önceden hesaplanmış tablo — mevcut tüm çağıranlar (29 web component'i) değişmeden çalışmaya devam eder. */
export const componentSize: Record<ExtendedSize, ComponentSizeTokens> = buildComponentSize();
