import type { ViewStyle, TextStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { nativeFontFamily } from "../../theme/fontFamily";
import { nativeSize } from "../../theme/nativeSize";
import { defaultNativeConfig, type NativeConfig } from "../../nativeConfig";
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
  extraText: TextStyle;
  divider: ViewStyle;
  body: ViewStyle;
  bodyText: TextStyle;
  footer: ViewStyle;
  actions: ViewStyle;
  action: ViewStyle;
  actionDivider: ViewStyle;
}

export function cardRecipe(theme: Theme, { size = "md", bordered, inset }: CardRecipeOptions, config: NativeConfig = defaultNativeConfig): CardRecipeResult {
  const sz = nativeSize(theme, size, config);
  const layout = config.card[size];
  const padding = layout.padding;
  const bodyText: TextStyle = {
    fontFamily: nativeFontFamily(theme.fontFamily.sans),
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    color: theme.color.canvas.foreground,
  };
  return {
    container: {
      minWidth: 0,
      borderRadius: toPx(theme.radius[layout.radius]),
      backgroundColor: inset ? theme.color.canvas.surfaceAlt : theme.color.canvas.surface,
      overflow: "hidden",
      ...(bordered || inset ? { borderWidth: 1, borderColor: theme.color.canvas.border } : {}),
    },
    // Hareket yok: azaltılmış hareket tercihinde de güvenli dokunma geri bildirimi.
    pressedContainer: { backgroundColor: theme.color.canvas.surfaceAlt, borderColor: theme.color.canvas.ring },
    header: { flexDirection: "row", alignItems: "center", gap: toPx(theme.spacing[3]), minHeight: layout.headerMinHeight, paddingHorizontal: padding, paddingVertical: layout.headerPaddingVertical },
    titleText: { ...bodyText, fontFamily: nativeFontFamily(theme.fontFamily.heading ?? theme.fontFamily.sans), fontWeight: "600" },
    extraText: { ...bodyText, color: theme.color.canvas.muted },
    divider: { height: 1, backgroundColor: theme.color.canvas.border },
    // flexGrow, flex:1'in sıfır tabanı yerine içeriğin gerçek yüksekliğini korur.
    body: { flexGrow: 1, padding },
    bodyText,
    footer: { paddingHorizontal: padding, paddingVertical: layout.footerPaddingVertical },
    actions: { flexDirection: "row", borderTopWidth: 1, borderColor: theme.color.canvas.border },
    action: { flex: 1, minWidth: 0, minHeight: 44, alignItems: "center", justifyContent: "center", paddingVertical: layout.actionPaddingVertical },
    actionDivider: { borderStartWidth: 1, borderColor: theme.color.canvas.border },
  };
}
