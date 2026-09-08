import type { ViewStyle, TextStyle } from "react-native";
import { componentSize, resolveColorVariant, type ColorRole, type ColorVariantStyle, type Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { resolveColorVariantStyle } from "../../theme/colorVariantStyle";
import { resolveComponentSize } from "../../theme/sizeToRNStyle";
import type { InputShape, InputVariant } from "../../Input/types";

export interface InputRecipeOptions {
  color: ColorRole;
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
  const colorStyle = resolveColorVariantStyle(theme, resolveInputColorRefs(color, variant));
  const sizeStyle = resolveComponentSize(componentSize[size]);
  const hasBorderColor = Boolean(colorStyle.container.borderColor);
  const borderWidth = hasBorderColor && variant !== "underlined" ? (focused ? 2 : 1) : 0;
  const underlineWidth = hasBorderColor && variant === "underlined" ? (focused ? 2 : 1) : 0;

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
    ...(disabled && { opacity: 0.5 }),
  };

  const input: TextStyle = {
    flex: 1,
    fontSize: sizeStyle.label.fontSize,
    color: theme.color.canvas.foreground,
  };

  return { container, input };
}
