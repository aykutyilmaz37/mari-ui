import { nativeFontFamily } from "../../theme/fontFamily";
import type { ViewStyle, TextStyle } from "react-native";
import { resolveColorVariant, type ColorRole, type ExtendedSize, type Variant } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { resolveColorVariantStyle } from "../../theme/colorVariantStyle";
import { nativeSize } from "../../theme/nativeSize";
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
  /** İkon boyutu (px) — native ölçek: xs 14 · sm 16 · md 18 · lg 20 · xl 22. */
  iconSize: number;
  /** Görünümü değiştirmeden dokunma alanını 44px'e tamamlayan pay (web `touchTargetClass`). */
  hitSlop: { top: number; bottom: number; left: number; right: number };
}

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
  const sz = nativeSize(theme, size);
  const isCircle = shape === "circle";

  const container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: sz.gap,
    height: sz.height,
    paddingHorizontal: isCircle ? 0 : sz.paddingHorizontal,
    borderRadius: SHAPE_RADIUS[shape] ?? sz.borderRadius,
    // `borderWidth`i variant'tan değil, `resolveColorVariant`in fiilen bir
    // `border` token'ı üretip üretmediğinden türetiyoruz — "outline mı değil
    // mi" kararını burada TEKRAR yazmak yerine core'un tek kaynağına
    // güveniyoruz.
    borderWidth: colorStyle.container.borderColor ? 1 : 0,
    ...colorStyle.container,
    ...(isCircle && { aspectRatio: 1, width: sz.height }),
    ...(block && { width: "100%" }),
    ...(disabled && { opacity: 0.5 }),
  };

  const label: TextStyle = {
    fontFamily: nativeFontFamily(theme.fontFamily.sans),
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    fontWeight: "500",
    // Web'deki `variant="link"` alt çizgisiz (yalnız renk + dolgusuz) — birebir aynı.
    textDecorationLine: "none",
    ...colorStyle.label,
  };

  // Basılma = web'deki hover + active birlikte: solid'de koyu ton (core'un hoverBackground'u),
  // outline/ghost'ta rolün yumuşak zemini (web `bgSubtleHoverClass`), hepsinde %98 küçülme (`active:scale-[0.98]`).
  const interactiveSubtle = variant === "outline" || variant === "ghost" ? { backgroundColor: theme.color[color].subtle } : {};
  const pressedContainer: ViewStyle = { ...colorStyle.pressedContainer, ...interactiveSubtle, transform: [{ scale: 0.98 }] };

  const vertical = Math.max(0, Math.ceil((MIN_TOUCH - sz.height) / 2));
  // Yatay pay yalnız kare/daire (ikon) butonlarda — yan yana butonların alanları çakışmasın (web ile aynı kural).
  const horizontal = isCircle ? vertical : 0;

  return { container, pressedContainer, label, iconSize: sz.iconSize, hitSlop: { top: vertical, bottom: vertical, left: horizontal, right: horizontal } };
}
