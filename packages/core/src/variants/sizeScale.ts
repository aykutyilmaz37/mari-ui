import { fontSize, radius, spacing } from "@mari-ui/tokens";
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
 * Paylaşılan boyut skalası. Öncesinde `ButtonSize`, `InputSize`,
 * `DividerSize`, `SwitchSize`, `RangeSize` aynı `large|middle|small` union'ını
 * 6 kez tekrar ediyordu; Modal `small|medium|large`, Drawer `sm|md|lg`,
 * Skeleton `small|default|large` gibi FARKLI sözlükler kullanıyordu. Artık
 * `sm|md|lg` (gerekirse `xs`/`xl`) tek skala, ve her boyutun somut
 * height/padding/fontSize değeri buradan, `@mari-ui/tokens`'tan gelir —
 * component'ler kendi `getSizeClasses` sözlüğünü elle yazmaz.
 */
export const componentSize: Record<ExtendedSize, ComponentSizeTokens> = {
  xs: {
    height: spacing[5],
    paddingX: spacing[2],
    paddingY: spacing[0.5],
    fontSize: fontSize.xs,
    gap: spacing[1],
    radius: radius.sm,
  },
  sm: {
    height: spacing[6],
    paddingX: spacing[2],
    paddingY: spacing[1],
    fontSize: fontSize.xs,
    gap: spacing[1.5],
    radius: radius.sm,
  },
  md: {
    height: spacing[8],
    paddingX: spacing[3],
    paddingY: spacing[1.5],
    fontSize: fontSize.sm,
    gap: spacing[2],
    radius: radius.md,
  },
  lg: {
    height: spacing[10],
    paddingX: spacing[4],
    paddingY: spacing[2],
    fontSize: fontSize.md,
    gap: spacing[2],
    radius: radius.md,
  },
  xl: {
    height: spacing[12],
    paddingX: spacing[5],
    paddingY: spacing[2.5],
    fontSize: fontSize.lg,
    gap: spacing[2.5],
    radius: radius.lg,
  },
};
