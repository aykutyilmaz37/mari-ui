import { nativeFontFamily } from "../../theme/fontFamily";
import type { ViewStyle, TextStyle } from "react-native";
import { componentSize, resolveColorVariant, type ColorRole, type ColorVariantStyle, type Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { resolveColorVariantStyle } from "../../theme/colorVariantStyle";
import { resolveComponentSize } from "../../theme/sizeToRNStyle";
import type { InputShape, InputVariant } from "../../Input/types";

export interface InputRecipeOptions {
  color?: ColorRole;
  variant: InputVariant;
  size: Size;
  shape: InputShape;
  disabled: boolean;
  focused: boolean;
}

export interface InputRecipeResult {
  container: ViewStyle;
  input: TextStyle;
}

/** İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-conditional`). */
function resolveBorderWidth(active: boolean, focused: boolean): number {
  if (!active) return 0;
  return focused ? 2 : 1;
}

const SHAPE_RADIUS: Partial<Record<InputShape, number>> = {
  square: 0,
  pill: 9999,
};

/**
 * `InputVariant`in `"outline"|"soft"|"ghost"` üyeleri `@mari-ui/core`'un
 * `Variant` union'ının bir alt kümesidir — bu üçü için mantığı burada
 * TEKRAR yazmak yerine doğrudan `resolveColorVariant`e devrediyoruz.
 * `"underlined"` Input'a özgüdür (core'da karşılığı yok): görsel olarak
 * "outline"a yakındır ama tam kenarlık yerine sadece ALT kenarlık ister —
 * bu farkı `inputRecipe` (renk token'ı burada, kenarlık GEOMETRİSİ orada)
 * ayırıyor.
 */
function resolveInputColorRefs(color: ColorRole, variant: InputVariant): ColorVariantStyle {
  if (variant === "underlined") {
    return resolveColorVariant(color, "outline");
  }
  return resolveColorVariant(color, variant);
}

export function inputRecipe(theme: Theme, options: InputRecipeOptions): InputRecipeResult {
  const { color, variant, size, shape, disabled, focused } = options;
  const colorStyle = resolveColorVariantStyle(theme, resolveInputColorRefs(color ?? "primary", variant));
  const sizeStyle = resolveComponentSize(componentSize[size]);
  const hasBorderColor = variant !== "ghost";
  const borderColor = color ? theme.color[color].border : theme.color.canvas.input;
  const activeBorder = focused ? theme.color[color ?? "primary"].border : borderColor;
  const borderWidth = resolveBorderWidth(hasBorderColor && variant !== "underlined", focused);
  const underlineWidth = resolveBorderWidth(hasBorderColor && variant === "underlined", focused);

  const container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    height: sizeStyle.container.height,
    paddingHorizontal: sizeStyle.container.paddingHorizontal,
    gap: sizeStyle.container.gap,
    borderRadius: variant === "underlined" ? 0 : (SHAPE_RADIUS[shape] ?? sizeStyle.container.borderRadius),
    borderWidth,
    borderBottomWidth: variant === "underlined" ? underlineWidth : borderWidth,
    ...colorStyle.container,
    backgroundColor: variant === "soft" ? theme.color.canvas.surfaceAlt : theme.color.canvas.surface,
    ...(hasBorderColor && { borderColor: activeBorder }),
    ...(disabled && { opacity: 0.5 }),
  };

  const input: TextStyle = {
    fontFamily: nativeFontFamily(theme.fontFamily.sans),
    flex: 1,
    fontSize: sizeStyle.label.fontSize,
    color: theme.color.canvas.foreground,
  };

  return { container, input };
}
