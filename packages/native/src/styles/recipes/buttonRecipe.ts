import { lineHeightFor } from "../lineHeight";
import { nativeFontFamily } from "../../theme/fontFamily";
import type { ViewStyle, TextStyle } from "react-native";
import { componentSize, resolveColorVariant, type ColorRole, type ExtendedSize, type Variant } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { resolveColorVariantStyle } from "../../theme/colorVariantStyle";
import { resolveComponentSize } from "../../theme/sizeToRNStyle";
import type { ButtonShape } from "../../Button/types";

export interface ButtonRecipeOptions {
  color: ColorRole;
  variant: Variant;
  size: ExtendedSize;
  shape: ButtonShape;
  block: boolean;
  disabled: boolean;
}

export interface ButtonRecipeResult {
  container: ViewStyle;
  pressedContainer: ViewStyle;
  label: TextStyle;
  /** İkon boyutu (px) — web `iconSizeClass`: xs 12 · sm 14 · md 16 · lg 18 · xl 20. */
  iconSize: number;
  /** Görünümü değiştirmeden dokunma alanını 44px'e tamamlayan pay (web `touchTargetClass`). */
  hitSlop: { top: number; bottom: number; left: number; right: number };
}

/** Web `iconSizeClass` ile aynı. */
const ICON_SIZE: Record<ExtendedSize, number> = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 };
/** Önerilen en küçük dokunma hedefi (Apple HIG 44pt). */
const MIN_TOUCH = 44;

/**
 * `shape` boyuttan gelen radius'u geçersiz kılar (`default` hariç — o boyutun
 * kendi radius token'ını kullanır). `circle`, web'deki `!px-0 aspect-square`
 * ikilisinin native karşılığıdır: `container`'a ayrıca `aspectRatio: 1` ve
 * `width: height` uygulanır (bkz. aşağıda).
 */
const SHAPE_RADIUS: Partial<Record<ButtonShape, number>> = {
  square: 0,
  pill: 9999,
  circle: 9999,
};

/**
 * `color` + `variant` + `size` + `shape` kombinasyonunu somut RN stiline
 * çözer. Yalnızca tip-only `react-native` import'u taşır — `StyleSheet.
 * create` ÇAĞIRMAZ (bu, çağıran `useStyles` hook'unun işi); bu sayede vitest
 * altında gerçek RN paketini hiç yüklemeden test edilebilir.
 */
export function buttonRecipe(theme: Theme, options: ButtonRecipeOptions): ButtonRecipeResult {
  const { color, variant, size, shape, block, disabled } = options;
  const colorStyle = resolveColorVariantStyle(theme, resolveColorVariant(color, variant));
  const sizeStyle = resolveComponentSize(componentSize[size]);
  const isCircle = shape === "circle";

  const container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: sizeStyle.container.gap,
    height: sizeStyle.container.height,
    paddingHorizontal: isCircle ? 0 : sizeStyle.container.paddingHorizontal,
    paddingVertical: sizeStyle.container.paddingVertical,
    borderRadius: SHAPE_RADIUS[shape] ?? sizeStyle.container.borderRadius,
    // `borderWidth`i variant'tan değil, `resolveColorVariant`in fiilen bir
    // `border` token'ı üretip üretmediğinden türetiyoruz — "outline mı değil
    // mi" kararını burada TEKRAR yazmak yerine core'un tek kaynağına
    // güveniyoruz.
    borderWidth: colorStyle.container.borderColor ? 1 : 0,
    ...colorStyle.container,
    ...(isCircle && { aspectRatio: 1, width: sizeStyle.container.height }),
    ...(block && { width: "100%" }),
    ...(disabled && { opacity: 0.5 }),
  };

  const label: TextStyle = {
    fontFamily: nativeFontFamily(theme.fontFamily.sans),
    fontSize: sizeStyle.label.fontSize,
    lineHeight: lineHeightFor(sizeStyle.label.fontSize),
    fontWeight: "500",
    // Web'deki `variant="link"` alt çizgisiz (yalnız renk + dolgusuz) — birebir aynı.
    textDecorationLine: "none",
    ...colorStyle.label,
  };

  // Basılma = web'deki hover + active birlikte: solid'de koyu ton (core'un hoverBackground'u),
  // outline/ghost'ta rolün yumuşak zemini (web `bgSubtleHoverClass`), hepsinde %98 küçülme (`active:scale-[0.98]`).
  const interactiveSubtle = variant === "outline" || variant === "ghost" ? { backgroundColor: theme.color[color].subtle } : {};
  const pressedContainer: ViewStyle = { ...colorStyle.pressedContainer, ...interactiveSubtle, transform: [{ scale: 0.98 }] };

  const height = Number(sizeStyle.container.height) || 0;
  const vertical = Math.max(0, Math.ceil((MIN_TOUCH - height) / 2));
  // Yatay pay yalnız kare/daire (ikon) butonlarda — yan yana butonların alanları çakışmasın (web ile aynı kural).
  const horizontal = isCircle ? vertical : 0;

  return { container, pressedContainer, label, iconSize: ICON_SIZE[size], hitSlop: { top: vertical, bottom: vertical, left: horizontal, right: horizontal } };
}
