import React, { cloneElement, isValidElement } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Button } from "../Button";
import { InboxIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";

export interface EmptyProps extends SkeletonableProps {
  title: string;
  description?: React.ReactNode;
  /** Tek ana eylem; `onPress` ile birlikte. */
  buttonText?: string;
  onPress?: () => void;
  buttonIcon?: React.ReactNode;
  /** Birden çok eylem (verilirse `buttonText` yok sayılır). */
  actions?: React.ReactNode;
  /** Varsayılan: gelen kutusu. */
  icon?: React.ReactNode;
  /** `sm`: kart/liste içi; `md`: ekranın ana durumu. Varsayılan: `md`. */
  size?: "sm" | "md";
  /** Başlık ekran okuyucuda başlık (`header`) olsun — ekranın ana içeriği boşsa. */
  heading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE = {
  sm: { padding: 32, circle: 40, glyph: 20, gap: 6, action: 12 },
  md: { padding: 48, circle: 64, glyph: 32, gap: 8, action: 16 },
} as const;

/** Düz metin → `Text`; iskelette görünmez metnin boyutunda kutu (yüklenince kayma yok). */
function Line({ children, style, skeleton }: { children: React.ReactNode; style: object; skeleton: boolean }) {
  const text = typeof children === "string" || typeof children === "number" ? <Text style={style}>{children}</Text> : children;
  return skeleton ? <SkeletonBox style={{ borderRadius: 4, maxWidth: "100%" }}>{text}</SkeletonBox> : <>{text}</>;
}

/** Boş durum: neden boş + ne yapılabilir. Liste, arama sonucu, sepet. */
export function Empty({ title, description, buttonText, onPress, buttonIcon, actions, icon, size = "md", heading = false, skeleton = false, style }: Readonly<EmptyProps>) {
  const theme = useTheme();
  const t = useNativeConfig().typography;
  const s = SIZE[size];
  const font = nativeFontFamily(theme.fontFamily.sans);
  const titleMetrics = size === "md" ? t.h4 : t.h6;
  const titleStyle = { fontFamily: font, fontSize: titleMetrics.fontSize, lineHeight: titleMetrics.lineHeight, fontWeight: "600" as const, color: theme.color.canvas.foreground, textAlign: "center" as const };
  const descriptionStyle = { fontFamily: font, fontSize: size === "md" ? 15 : 13, lineHeight: size === "md" ? 20 : 18, color: theme.color.canvas.muted, textAlign: "center" as const };
  const glyph = isValidElement<{ size?: number; color?: string }>(icon) ? cloneElement(icon, { size: icon.props.size ?? s.glyph, color: icon.props.color ?? theme.color.canvas.muted }) : (icon ?? <InboxIcon size={s.glyph} color={theme.color.canvas.muted} />);

  let action: React.ReactNode = null;
  if (actions) action = <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>{actions}</View>;
  else if (buttonText && onPress) action = <Button size={size === "sm" ? "sm" : "md"} icon={buttonIcon} onPress={onPress} skeleton={skeleton}>{buttonText}</Button>;

  return (
    <View
      accessibilityElementsHidden={skeleton} aria-hidden={skeleton}
      importantForAccessibility={skeleton ? "no-hide-descendants" : "auto"}
      style={[{ alignItems: "center", justifyContent: "center", paddingVertical: s.padding, paddingHorizontal: 16, gap: s.gap, alignSelf: "stretch" }, style]}
    >
      {skeleton ? (
        <SkeletonBox style={{ width: s.circle, height: s.circle, borderRadius: s.circle / 2, marginBottom: 4 }} />
      ) : (
        <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ width: s.circle, height: s.circle, borderRadius: s.circle / 2, marginBottom: 4, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.canvas.surfaceAlt }}>
          {glyph}
        </View>
      )}
      <Line skeleton={skeleton} style={titleStyle}>
        <Text accessibilityRole={heading ? "header" : undefined} style={titleStyle}>{title}</Text>
      </Line>
      {description != null ? (
        <View style={{ maxWidth: 448 }}>
          <Line skeleton={skeleton} style={descriptionStyle}>{description}</Line>
        </View>
      ) : null}
      {action ? <View style={{ marginTop: s.action - s.gap }}>{action}</View> : null}
    </View>
  );
}
