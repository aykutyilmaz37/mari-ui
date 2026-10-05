import React from "react";
import { Pressable, Text, View, type AccessibilityRole, type AccessibilityState, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { SkeletonBox } from "./Skeleton";

/** Satırın en küçük yüksekliği — Apple HIG dokunma hedefi. */
const MIN_TOUCH = 44;

export interface SelectionRowProps {
  role: AccessibilityRole;
  state: AccessibilityState;
  onPress: () => void;
  disabled?: boolean;
  size: Size;
  /** Kutu (Checkbox) ya da daire (Radio) — boyutu `selection[size].box`. */
  control: React.ReactNode;
  label?: React.ReactNode;
  description?: React.ReactNode;
  skeleton?: boolean;
  /** Etiket yoksa erişilebilir ad. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Düz metin → `Text`; öğe olduğu gibi. İskelette görünmez metnin boyutunda kutu. */
function RowText({ node, textStyle, skeleton }: { node: React.ReactNode; textStyle: TextStyle; skeleton: boolean }) {
  if (node == null) return null;
  const content = typeof node === "string" || typeof node === "number" ? <Text style={textStyle}>{node}</Text> : node;
  return skeleton ? <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start" }}>{content}</SkeletonBox> : <>{content}</>;
}

/**
 * Checkbox ve Radio'nun ortak satırı: kontrol + etiket + açıklama, satırın
 * TAMAMI dokunulabilir (web'deki `<label>` sarmalının karşılığı) ve en az 44pt.
 * Açıklama etiketin altında, kontrolün hizasından içeride; ekran okuyucuda
 * etiketle birlikte tek öğe olarak okunur.
 */
export function SelectionRow({ role, state, onPress, disabled = false, size, control, label, description, skeleton = false, accessibilityLabel, style }: SelectionRowProps) {
  const theme = useTheme();
  const m = useNativeConfig().selection[size];
  const font = nativeFontFamily(theme.fontFamily.sans);
  const labelStyle = { fontFamily: font, fontSize: m.fontSize, lineHeight: m.lineHeight, color: disabled ? theme.color.canvas.disabled : theme.color.canvas.foreground };
  const descriptionStyle = { fontFamily: font, fontSize: m.descriptionFontSize, lineHeight: m.descriptionLineHeight, color: theme.color.canvas.muted };
  // Kutu etiketin ilk satırıyla ortalanır (çok satırlı etikette tepeye değil ilk satıra hizalı).
  const controlOffset = Math.max(0, (m.lineHeight - m.box) / 2);
  const textBlock = label != null || description != null;

  const content = (
    <>
      <View style={{ marginTop: textBlock ? controlOffset : 0 }}>{skeleton ? <SkeletonBox style={{ width: m.box, height: m.box, borderRadius: role === "radio" ? m.box / 2 : m.radius }} /> : control}</View>
      {textBlock ? (
        <View style={{ flexShrink: 1, gap: 2 }}>
          <RowText node={label} textStyle={labelStyle} skeleton={skeleton} />
          <RowText node={description} textStyle={descriptionStyle} skeleton={skeleton} />
        </View>
      ) : null}
    </>
  );

  const rowStyle: ViewStyle = { flexDirection: "row", alignItems: textBlock ? "flex-start" : "center", gap: m.gap, minHeight: MIN_TOUCH, paddingVertical: Math.max(0, (MIN_TOUCH - Math.max(m.lineHeight, m.box)) / 2) };

  if (skeleton) {
    return (
      <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={[rowStyle, style]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ ...state, disabled }}
      aria-checked={state.checked}
      aria-disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, { opacity: pressed && !disabled ? 0.7 : 1 }, style]}
    >
      {content}
    </Pressable>
  );
}
