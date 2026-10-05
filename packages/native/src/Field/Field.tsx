import React, { useMemo } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { FieldContext, type FieldContextValue } from "../lib/fieldContext";
import { SkeletonBox } from "../lib/Skeleton";

export interface FieldProps {
  label: React.ReactNode;
  /** Alanın altında yardımcı metin. */
  hint?: React.ReactNode;
  /** Doluysa kontrol hata rengine geçer ve mesaj okunur (ipucunun yerine). */
  error?: React.ReactNode;
  /** Etikette görsel yıldız; ekran okuyucuda etikete ", zorunlu" eklenir. */
  required?: boolean;
  disabled?: boolean;
  /** `horizontal`: etiket solda (%35), kontrol sağda — ayar ekranları için. Varsayılan: `vertical`. */
  layout?: "vertical" | "horizontal";
  /** Etiket ve kontrol birlikte iskelet çizer (kontrol `skeleton`ı buradan alır). */
  skeleton?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const asText = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : undefined);

/**
 * Form alanı: etiket + kontrol + ipucu/hata. İçindeki mari-ui kontrolü
 * (Input, Textarea, OtpInput, Segmented, Checkbox…) etiketini erişilebilir ad,
 * hatayı/ipucunu erişilebilir ipucu olarak alır; hata varsa kırmızıya geçer.
 */
export function Field({ label, hint, error, required = false, disabled = false, layout = "vertical", skeleton = false, style, children }: FieldProps) {
  const theme = useTheme();
  const t = useNativeConfig().typography;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const invalid = error != null && error !== false && error !== "";
  const context = useMemo<FieldContextValue>(
    () => ({ label: asText(label), hint: asText(hint), error: invalid ? asText(error) : undefined, invalid, required, disabled, skeleton }),
    [label, hint, error, invalid, required, disabled, skeleton]
  );

  // Etiket HIG Subheadline 15/20, ipucu/hata Footnote 13/18.
  const labelStyle = { fontFamily: font, fontSize: t.h6.fontSize, lineHeight: t.h6.lineHeight, fontWeight: "500" as const, color: theme.color.canvas.foreground, opacity: disabled ? 0.5 : 1 };
  const smallStyle = { fontFamily: font, fontSize: 13, lineHeight: 18 };
  const labelText = (
    <Text style={labelStyle} importantForAccessibility="no" accessibilityElementsHidden>
      {label}
      {required && !skeleton ? <Text style={{ color: theme.color.error.text }}> *</Text> : null}
    </Text>
  );
  const horizontal = layout === "horizontal";

  return (
    <FieldContext.Provider value={context}>
      <View style={[{ flexDirection: horizontal ? "row" : "column", gap: horizontal ? 16 : 6, alignSelf: "stretch" }, style]}>
        <View style={horizontal ? { width: "35%", minHeight: 44, justifyContent: "center" } : undefined}>
          {skeleton ? <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start" }}>{labelText}</SkeletonBox> : labelText}
        </View>
        <View style={{ flex: horizontal ? 1 : undefined, gap: 6 }}>
          {children}
          {invalid && !skeleton ? (
            <Text accessibilityLiveRegion="polite" aria-live="polite" style={[smallStyle, { color: theme.color.error.text }]}>
              {error}
            </Text>
          ) : null}
          {!invalid && hint != null && !skeleton ? <Text style={[smallStyle, { color: theme.color.canvas.muted }]}>{hint}</Text> : null}
          {!invalid && hint != null && skeleton ? (
            <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start" }}>
              <Text style={smallStyle}>{hint}</Text>
            </SkeletonBox>
          ) : null}
        </View>
      </View>
    </FieldContext.Provider>
  );
}
