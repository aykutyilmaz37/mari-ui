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
}

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
    fontWeight: "500",
    // Web'de `variant="link"` bir `<a>` gibi altı çizili görünür; native'de
    // href/anchor kavramı yok ama bu görsel ipucu metinle taşınabilir.
    textDecorationLine: variant === "link" ? "underline" : "none",
    ...colorStyle.label,
  };

  return { container, pressedContainer: colorStyle.pressedContainer, label };
}
