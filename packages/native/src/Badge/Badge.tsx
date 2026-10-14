import React from "react";
import { Animated, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { skeletonColor } from "../theme/skeletonColor";
import { Hug } from "../lib/Hug";
import { displayCount, isBadgeHidden } from "./utils";
import { SkeletonBox, usePulse, type SkeletonableProps } from "../lib/Skeleton";

export interface BadgeProps extends SkeletonableProps {
  /** Sayı ya da kısa metin ("Yeni"). `0` varsayılan olarak gizlenir (`showZero`). */
  count?: number | string;
  /** Bu sayıdan büyükse "N+" gösterilir. Varsayılan: `99`. */
  overflowCount?: number;
  showZero?: boolean;
  /** Sayı yerine küçük nokta. */
  dot?: boolean;
  /** Varsayılan: `error`. */
  color?: ColorRole;
  /** `sm` 16 / `md` 20pt kabarcık. Varsayılan: `md`. */
  size?: "sm" | "md";
  /**
   * Ekran okuyucu metni, ör. "3 okunmamış bildirim". Sarılan öğe bir düğmeyse
   * sayıyı düğmenin kendi `accessibilityLabel`ına katmak daha iyidir.
   */
  label?: string;
  /** Kabarcığı köşeden kaydırır: `[x, y]` pt (x sağa, y aşağı). */
  offset?: [number, number];
  /** Kabarcığın oturduğu öğe (ikon düğmesi, avatar). Verilmezse kabarcık tek başına durur. */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface StatusBadgeProps extends SkeletonableProps {
  color?: ColorRole;
  /** Durum metni ("Aktif"). Renk tek başına anlam taşımaz; metin zorunlu. */
  children: React.ReactNode;
  /** Süren işlem: nokta nabız atar (hareket azaltmada durur). */
  processing?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Kabarcık geometrisi. Bir öğeye oturduğunda zemin renginde 2pt halka alır ve
 * merkezi köşeye denk gelir (web `translate(50%, -50%)` karşılığı; genişleyen
 * "99+" sola doğru büyür).
 */
function bubbleGeometry(height: number, standalone: boolean, offset: [number, number] | undefined): ViewStyle {
  const ring = standalone ? 0 : 2;
  const outer = height + ring * 2;
  const base: ViewStyle = { minWidth: outer, height: outer, borderRadius: outer / 2, borderWidth: ring, alignItems: "center", justifyContent: "center" };
  if (standalone) return base;
  const [x, y] = offset ?? [0, 0];
  return { ...base, position: "absolute", top: -outer / 2 + y, right: -outer / 2 - x, zIndex: 1 };
}

export function Badge({ count, overflowCount = 99, showZero = false, dot = false, color = "error", size = "md", label, offset, children, skeleton = false, style }: Readonly<BadgeProps>) {
  const theme = useTheme();
  const metrics = useNativeConfig().badge[size];
  const text = displayCount(count, overflowCount);
  const hidden = isBadgeHidden(dot, text, count, showZero);
  const standalone = children === undefined;
  const bubbleStyle: ViewStyle = {
    ...bubbleGeometry(dot ? metrics.dot : metrics.height, standalone, offset),
    borderColor: theme.color.canvas.surface,
    paddingHorizontal: dot ? 0 : metrics.paddingHorizontal,
    backgroundColor: skeleton ? skeletonColor(theme) : theme.color[color].solid,
  };

  const announced = Boolean(label) && !skeleton;
  const bubble = hidden ? null : (
    <View
      accessible={announced}
      accessibilityLabel={announced ? label : undefined}
      accessibilityElementsHidden={!announced} aria-hidden={!announced}
      importantForAccessibility={announced ? "yes" : "no-hide-descendants"}
      pointerEvents="none"
      style={bubbleStyle}
    >
      {dot ? null : (
        <Text
          numberOfLines={1}
          style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: metrics.fontSize, lineHeight: metrics.height, fontWeight: "600", fontVariant: ["tabular-nums"], color: skeleton ? "transparent" : theme.color[color].solidContrast }}
        >
          {text}
        </Text>
      )}
    </View>
  );

  return (
    <Hug style={style}>
      <View>
        {children}
        {bubble}
      </View>
    </Hug>
  );
}

const STATUS_DOT = 8;

export function StatusBadge({ color = "neutral", children, processing = false, skeleton = false, style }: Readonly<StatusBadgeProps>) {
  const theme = useTheme();
  const subhead = useNativeConfig().typography.h6;
  const halo = usePulse(processing && !skeleton, 0.15);
  const dotColor = theme.color[color].solid;
  const textStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: subhead.fontSize, lineHeight: subhead.lineHeight, color: theme.color.canvas.foreground };

  return (
    <Hug style={style}>
      <View
        accessibilityElementsHidden={skeleton} aria-hidden={skeleton}
        importantForAccessibility={skeleton ? "no-hide-descendants" : "auto"}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <View style={{ width: STATUS_DOT, height: STATUS_DOT }}>
          {processing && !skeleton ? (
            <Animated.View style={{ position: "absolute", top: -4, left: -4, width: STATUS_DOT + 8, height: STATUS_DOT + 8, borderRadius: STATUS_DOT, backgroundColor: dotColor, opacity: halo.interpolate({ inputRange: [0.15, 1], outputRange: [0.45, 0] }) }} />
          ) : null}
          <View style={{ width: STATUS_DOT, height: STATUS_DOT, borderRadius: STATUS_DOT / 2, backgroundColor: skeleton ? skeletonColor(theme) : dotColor }} />
        </View>
        {skeleton ? (
          <SkeletonBox style={{ borderRadius: 4 }}>
            <Text style={textStyle}>{children}</Text>
          </SkeletonBox>
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
      </View>
    </Hug>
  );
}
