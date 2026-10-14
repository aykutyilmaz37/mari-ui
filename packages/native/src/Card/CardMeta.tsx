import { View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { nativeSize } from "../theme/nativeSize";
import { nativeFontFamily } from "../theme/fontFamily";
import { toPx } from "../theme/toPx";
import { useNativeConfig } from "../nativeConfig";
import { cardText } from "./Card";
import type { CardMetaProps } from "./types";

/** Web CardMeta: avatar + tek satır başlık + çok satırlı açıklama. */
export function CardMeta({ avatar, title, description, style }: Readonly<CardMetaProps>) {
  const theme = useTheme();
  const config = useNativeConfig();
  const titleSize = nativeSize(theme, "md", config);
  const descriptionSize = nativeSize(theme, "sm", config);
  const textStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), color: theme.color.canvas.foreground };
  return (
    <View style={[{ flexDirection: "row", gap: toPx(theme.spacing[4]), minWidth: 0 }, style]}>
      {avatar != null ? <View style={{ flexShrink: 0 }}>{cardText(avatar, textStyle)}</View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title != null ? cardText(title, { ...textStyle, fontSize: titleSize.fontSize, lineHeight: titleSize.lineHeight, fontWeight: "600" }, 1) : null}
        {description != null ? <View style={title != null ? { marginTop: toPx(theme.spacing[1]) } : undefined}>{cardText(description, { ...textStyle, color: theme.color.canvas.muted, fontSize: descriptionSize.fontSize, lineHeight: descriptionSize.lineHeight })}</View> : null}
      </View>
    </View>
  );
}
