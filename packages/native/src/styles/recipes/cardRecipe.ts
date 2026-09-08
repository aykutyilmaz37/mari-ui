import type { ViewStyle, TextStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { toPx } from "../../theme/toPx";

export interface CardRecipeOptions {
  size?: Size;
  bordered: boolean;
  inset: boolean;
}

export interface CardRecipeResult {
  container: ViewStyle;
  pressedContainer: ViewStyle;
  header: ViewStyle;
  titleText: TextStyle;
  divider: ViewStyle;
  body: ViewStyle;
  bodyText: TextStyle;
  footer: ViewStyle;
}

/**
 * Web'in `fontSizeClass` sözlüğüyle (bkz. `components/src/lib/sizeClasses.
 * ts`) BİLİNÇLİ OLARAK aynı eşleme: Card'ın `size`'ı layout'u değil sadece
 * gövde yazı tipi boyutunu etkiler (web'de de `getBaseClassname` sadece
 * `fontSizeClass[size]` uyguluyor, `sizeClass`ı değil).
 */
const CARD_FONT_SIZE: Record<Size, keyof Theme["fontSize"]> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

/** Web'in `p-4` sabiti — Card'ın header/body/footer padding'i boyuttan bağımsızdır. */
const CARD_PADDING = "1rem";

export function cardRecipe(theme: Theme, options: CardRecipeOptions): CardRecipeResult {
  const { size = "md", bordered, inset } = options;
  const padding = toPx(CARD_PADDING);
  const backgroundColor = inset ? theme.color.canvas.surfaceAlt : theme.color.canvas.surface;
  const showBorder = bordered || inset;

  const container: ViewStyle = {
    borderRadius: toPx(theme.radius.lg),
    backgroundColor,
    overflow: "hidden",
    ...(showBorder && { borderWidth: 1, borderColor: theme.color.canvas.border }),
  };

  // Web'in `hoverable && "hover:shadow-md"`ının native karşılığı: `pressed`
  // durumunda beliren bir gölge. Sadece `onPress` + `hoverable` birlikteyken
  // component tarafından uygulanır.
  const pressedContainer: ViewStyle = {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  };

  const header: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding,
  };

  const titleText: TextStyle = {
    fontWeight: "600",
    fontSize: toPx(theme.fontSize[CARD_FONT_SIZE[size]]),
    color: theme.color.canvas.foreground,
  };

  const divider: ViewStyle = {
    height: 1,
    backgroundColor: theme.color.canvas.border,
  };

  const body: ViewStyle = { padding };

  const bodyText: TextStyle = {
    fontSize: toPx(theme.fontSize[CARD_FONT_SIZE[size]]),
    color: theme.color.canvas.foreground,
  };

  const footer: ViewStyle = { padding };

  return { container, pressedContainer, header, titleText, divider, body, bodyText, footer };
}
