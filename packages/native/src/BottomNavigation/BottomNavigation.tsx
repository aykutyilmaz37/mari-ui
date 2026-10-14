import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeBottomNavigationSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useMotionScale, useTheme } from "../theme/useTheme";

import { useSafeInsets } from "../theme/insets";
import { Badge } from "../Badge";
import { SkeletonBox, SkeletonText, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";

/** `pill`: Material 3 — aktif ikonun arkasında hap zemin. `plain`: iOS — yalnız renk değişir. */
export type BottomNavigationVariant = "pill" | "plain";

export interface BottomNavigationIconState {
  active: boolean;
  /** O anki ikon rengi (RN'de `currentColor` yok). */
  color: string;
  size: number;
}

export interface BottomNavigationItem {
  key: string;
  label: string;
  /** Fonksiyon verilirse durum ve rengi alır — aktifte dolu ikon göstermek için `active`'i kullanın. */
  icon: React.ReactNode | ((state: BottomNavigationIconState) => React.ReactNode);
  /** Sayı rozeti; `true` nokta. Sayıyı `accessibilityLabel`a da yazın. */
  badge?: number | boolean;
  disabled?: boolean;
  /** Varsayılan: `label`. */
  accessibilityLabel?: string;
}

export interface BottomNavigationProps extends SkeletonableProps {
  items: BottomNavigationItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  /** Zaten seçili sekmeye yeniden dokunulunca (ör. listeyi başa kaydır). */
  onReselect?: (key: string) => void;
  /** Varsayılan: `pill`. */
  variant?: BottomNavigationVariant;
  /** Aktif sekmenin rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Etiketleri gizler (yalnız ikon; erişilebilir ad yine `label`). */
  hideLabels?: boolean;
  /** Alt güvenli alan payı (ev çubuğu). Varsayılan: `ThemeProvider insets`in `bottom`ı, yoksa 0. */
  bottomInset?: number;
  /** Üst ayırıcı çizgi. Varsayılan: `true`. */
  bordered?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** M3 göstergesi: seçilince ortadan yanlara açılır (hareket azaltmada anlık). */
function usePillAnim(active: boolean) {
  const motion = useMotionScale();
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) {
      v.setValue(active ? 1 : 0);
      return;
    }
    Animated.timing(v, { toValue: active ? 1 : 0, duration: Math.round(200 * motion), easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [active, reduce, v, motion]);
  return v;
}

interface ItemProps {
  item: BottomNavigationItem;
  active: boolean;
  onPress: () => void;
  variant: BottomNavigationVariant;
  color: ColorRole;
  hideLabels: boolean;
  skeleton: boolean;
  m: NativeBottomNavigationSize;
  theme: Theme;
}

function iconColor(variant: BottomNavigationVariant, active: boolean, color: ColorRole, theme: Theme): string {
  if (!active) return theme.color.canvas.muted;
  return variant === "pill" ? theme.color[color].subtleContrast : theme.color[color].text;
}

function labelColor(variant: BottomNavigationVariant, active: boolean, color: ColorRole, theme: Theme): string {
  if (!active) return theme.color.canvas.muted;
  return variant === "pill" ? theme.color.canvas.foreground : theme.color[color].text;
}

function NavItem({ item, active, onPress, variant, color, hideLabels, skeleton, m, theme }: Readonly<ItemProps>) {
  const pill = usePillAnim(active);
  const ink = iconColor(variant, active, color, theme);
  const disabled = item.disabled ?? false;
  let icon = typeof item.icon === "function" ? item.icon({ active, color: ink, size: m.iconSize }) : item.icon;
  if (skeleton) icon = <SkeletonBox style={{ width: m.iconSize, height: m.iconSize, borderRadius: m.iconSize / 2 }} />;
  else if (item.badge === true) icon = <Badge dot>{icon}</Badge>;
  else if (typeof item.badge === "number") icon = <Badge count={item.badge} size="sm">{icon}</Badge>;

  const isPill = variant === "pill";
  const label = hideLabels ? null : (
    <Text numberOfLines={1} style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.labelFontSize, lineHeight: m.labelLineHeight, fontWeight: active ? "600" : "500", color: labelColor(variant, active, color, theme) }}>
      {item.label}
    </Text>
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.accessibilityLabel ?? item.label}
      accessibilityState={{ selected: active, disabled }}
      aria-selected={active}
      disabled={disabled || skeleton}
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", gap: isPill ? 4 : 2, opacity: (disabled ? 0.4 : 1) * (pressed && !active ? 0.6 : 1) })}
    >
      <View style={{ width: isPill ? m.indicatorWidth : undefined, height: isPill ? m.indicatorHeight : m.iconSize + 4, alignItems: "center", justifyContent: "center" }}>
        {isPill && !skeleton ? (
          <Animated.View
            pointerEvents="none"
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, borderRadius: m.indicatorHeight / 2, backgroundColor: theme.color[color].subtle, opacity: pill, transform: [{ scaleX: pill.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }}
          />
        ) : null}
        {/* Web'de mutlak konumlu gösterge akıştaki ikonun üstüne boyanır — ikon üst katmanda. */}
        <View style={{ zIndex: 1 }}>{icon}</View>
      </View>
      {label != null && skeleton ? <SkeletonText fontSize={m.labelFontSize} align="center">{label}</SkeletonText> : label}
    </Pressable>
  );
}

export function BottomNavigation({
  items,
  value,
  defaultValue,
  onChange,
  onReselect,
  variant = "pill",
  color = "primary",
  hideLabels = false,
  bottomInset: bottomInsetProp,
  bordered = true,
  skeleton = false,
  accessibilityLabel,
  style,
}: Readonly<BottomNavigationProps>) {
  const theme = useTheme();
  const m = useNativeConfig().bottomNavigation[variant];
  const safe = useSafeInsets();
  const bottomInset = bottomInsetProp ?? safe?.bottom ?? 0;
  const [active, setActive] = useControllable<string | undefined>(value, defaultValue ?? items[0]?.key);
  const c = theme.color.canvas;

  const press = (key: string) => {
    if (key === active) {
      onReselect?.(key);
      return;
    }
    setActive(key);
    onChange?.(key);
  };

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      aria-label={accessibilityLabel}
      style={[{ alignSelf: "stretch", flexDirection: "row", height: m.height + bottomInset, paddingBottom: bottomInset, paddingHorizontal: 4, backgroundColor: c.surface }, bordered ? { borderTopWidth: 1, borderTopColor: c.border } : null, style]}
    >
      {items.map((item) => (
        <NavItem key={item.key} item={item} active={item.key === active} onPress={() => press(item.key)} variant={variant} color={color} hideLabels={hideLabels} skeleton={skeleton} m={m} theme={theme} />
      ))}
    </View>
  );
}
