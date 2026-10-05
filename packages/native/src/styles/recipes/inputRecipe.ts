import { nativeFontFamily } from "../../theme/fontFamily";
import type { ViewStyle, TextStyle } from "react-native";
import { componentSize, type ColorRole, type Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { resolveComponentSize } from "../../theme/sizeToRNStyle";
import { withAlpha } from "../../theme/skeletonColor";
import { lineHeightFor } from "../lineHeight";
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
  /** Yer tutucu ve ikonların soluk rengi (`canvas.muted`). */
  mutedColor: string;
  /** Karakter sayacı yazısı (web `text-xs tabular-nums text-mari-muted`). */
  count: TextStyle;
  /** Görünümü değiştirmeden dokunma alanını 44px'e tamamlayan pay. */
  hitSlop: { top: number; bottom: number; left: number; right: number };
}

const MIN_TOUCH = 44;

/** Odak halesi (web `focus-within:ring-3 ring-<renk>/20`; ghost `ring-mari-ring/40`). */
function ring(color: string, alpha: number): ViewStyle {
  return { boxShadow: `0px 0px 0px 3px ${withAlpha(color, alpha)}` } as ViewStyle;
}

/**
 * Web `Input` ile birebir (getComputedStyle ölçümüyle doğrulandı):
 * - Köşe her boyutta 8px (web `rounded-md` boyutun köşesini ezer); `pill`
 *   tam yuvarlak + 16px yan boşluk; `square` ve `underlined` köşesiz.
 * - Dinlenme kenarlığı: renk verilmediyse `canvas.input` (nötr gri), verildiyse
 *   rolün metin rengi. Odakta kenarlık KALINLAŞMAZ (1px) — rolün metin rengine
 *   döner + 3px %20 hale. Ghost: kenarlık yok, odakta `canvas.ring` %40 hale.
 *   Underlined: yalnız alt çizgi, hale yok.
 * - Zemin: outline `surface`, soft `surfaceAlt`, ghost / underlined saydam.
 */
export function inputRecipe(theme: Theme, options: InputRecipeOptions): InputRecipeResult {
  const { color, variant, size, shape, disabled, focused } = options;
  const sizeStyle = resolveComponentSize(componentSize[size]);
  const accent = theme.color[color ?? "primary"].text;
  const restBorder = color ? theme.color[color].text : theme.color.canvas.input;
  const borderColor = focused ? accent : restBorder;

  let radius = theme.radius.md ? Number.parseFloat(theme.radius.md) * 16 : 8;
  if (shape === "pill") radius = 9999;
  if (shape === "square" || variant === "underlined") radius = 0;

  const variantStyle: Record<InputVariant, ViewStyle> = {
    outline: { borderWidth: 1, borderColor, backgroundColor: theme.color.canvas.surface, ...(focused && ring(accent, 0.2)) },
    soft: { borderWidth: 1, borderColor, backgroundColor: theme.color.canvas.surfaceAlt, ...(focused && ring(accent, 0.2)) },
    ghost: { borderWidth: 0, backgroundColor: "transparent", ...(focused && ring(theme.color.canvas.ring, 0.4)) },
    underlined: { borderWidth: 0, borderBottomWidth: 1, borderColor, backgroundColor: "transparent" },
  };

  const height = Number(sizeStyle.container.height) || 0;
  const vertical = Math.max(0, Math.ceil((MIN_TOUCH - height) / 2));

  const container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    height,
    paddingHorizontal: shape === "pill" && variant !== "underlined" ? 16 : sizeStyle.container.paddingHorizontal,
    gap: sizeStyle.container.gap,
    borderRadius: radius,
    ...variantStyle[variant],
    ...(disabled && { opacity: 0.5 }),
  };

  const input: TextStyle = {
    fontFamily: nativeFontFamily(theme.fontFamily.sans),
    flex: 1,
    minWidth: 0,
    // Tek satırlı TextInput'ta dikey ortalama: iç boşluk ve platform satır payı sıfırlanır.
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: sizeStyle.label.fontSize,
    color: theme.color.canvas.foreground,
  };

  const count: TextStyle = {
    fontFamily: nativeFontFamily(theme.fontFamily.sans),
    fontSize: 12,
    lineHeight: lineHeightFor(12),
    fontVariant: ["tabular-nums"],
    color: theme.color.canvas.muted,
  };

  return { container, input, mutedColor: theme.color.canvas.muted, count, hitSlop: { top: vertical, bottom: vertical, left: 0, right: 0 } };
}
