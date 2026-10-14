import React from "react";
import { Pressable, StyleSheet, View, type Insets, type StyleProp, type ViewStyle } from "react-native";

export interface FieldTriggerProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityValue?: { text: string };
  expanded: boolean;
  disabled: boolean;
  onPress: () => void;
  hitSlop?: Insets;
  style?: StyleProp<ViewStyle>;
  /** Alanın içi (yer tutucu, seçili etiket ya da kaldırılabilir etiketler). */
  display: React.ReactNode;
  /** İçerik yalnız tetikleyicinin değerini tekrarlıyorsa ekran okuyucudan gizlenir; kapatma düğmeli etiketlerde açık kalır. */
  displayAccessible: boolean;
  /** Sondaki düğme ("Temizle") — tetikleyicinin kardeşi. */
  action?: React.ReactNode;
  /** Sondaki gösterge (ok, yükleniyor). */
  indicator: React.ReactNode;
}

const hiddenProps = { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", "aria-hidden": true } as const;

/**
 * Seçim alanlarının (Select, TreeSelect) kapalı kutusu. Ekran okuyucunun
 * gördüğü düğme kutuyu kaplayan bir katman; etiketlerin kapatma ve "Temizle"
 * düğmeleri onun KARDEŞİ — düğme içinde düğme erişilebilirlikte geçersiz (axe
 * `nested-interactive`), içteki düğmelere ulaşılamaz. Kutunun kendisi rolsüz,
 * Tab durağı olmayan (`tabIndex -1`; RNW Pressable varsayılanı 0) bir dokunma
 * alanı: metne/etikete dokunmak da paneli açar (dokunuş ataya kabarır),
 * kapatma düğmeleri kendi dokunuşunu yakalar.
 */
export function FieldTrigger({ accessibilityLabel, accessibilityHint, accessibilityValue, expanded, disabled, onPress, hitSlop, style, display, displayAccessible, action, indicator }: FieldTriggerProps) {
  return (
    <Pressable accessible={false} tabIndex={-1} disabled={disabled} onPress={onPress} hitSlop={hitSlop} style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityValue={accessibilityValue}
        accessibilityState={{ expanded, disabled }}
        aria-expanded={expanded}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      />
      <View {...(displayAccessible ? null : hiddenProps)} style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", alignSelf: "stretch" }}>
        {display}
      </View>
      {action}
      <View {...hiddenProps}>{indicator}</View>
    </Pressable>
  );
}
