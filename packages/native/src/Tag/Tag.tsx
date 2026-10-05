import React from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { resolveColorVariant, type ColorRole, type Variant } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { resolveColorVariantStyle } from "../theme/colorVariantStyle";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { XIcon } from "../lib/icons";
import { Hug } from "../lib/Hug";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";

export interface TagProps extends SkeletonableProps {
  children: React.ReactNode;
  /** Varsayılan: `neutral`. */
  color?: ColorRole;
  /** Varsayılan: `soft`. */
  variant?: Extract<Variant, "solid" | "soft" | "outline">;
  icon?: React.ReactNode;
  /** `false` → kapatma düğmesi yok; düğüm → özel ikon. `onClose` verilince varsayılan × görünür. */
  closeIcon?: React.ReactNode | boolean;
  /** `soft`/`solid` için rolün kenarlık tonu. */
  bordered?: boolean;
  onClose?: () => void;
  /** Kapatma düğmesinin erişilebilir adı. Varsayılan: `"<metin> etiketini kaldır"` ya da `"Kaldır"`. */
  closeLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const MIN_TOUCH = 44;

export function Tag({ children, color = "neutral", variant = "soft", icon, closeIcon, bordered = false, onClose, closeLabel, skeleton = false, style }: TagProps) {
  const theme = useTheme();
  const metrics = useNativeConfig().tag;
  const colors = resolveColorVariantStyle(theme, resolveColorVariant(color, variant));
  const hasBorder = variant === "outline" || bordered;
  const showClose = closeIcon !== false && (closeIcon !== undefined || Boolean(onClose));
  const iconColor = (colors.label.color as string | undefined) ?? theme.color.canvas.foreground;

  const geometry: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: metrics.gap,
    paddingHorizontal: metrics.paddingHorizontal - (hasBorder ? 1 : 0),
    paddingVertical: metrics.paddingVertical - (hasBorder ? 1 : 0),
    borderRadius: toPx(theme.radius[metrics.radius]),
    borderWidth: hasBorder ? 1 : 0,
    maxWidth: "100%",
  };

  const label = (
    <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, fontWeight: "500", color: iconColor }}>
      {children}
    </Text>
  );
  const closeBox = { width: metrics.iconSize, height: metrics.iconSize, marginRight: -2 };

  if (skeleton) {
    return (
      <Hug style={style}>
        <SkeletonBox style={geometry}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: metrics.gap }}>
            {icon}
            {label}
            {showClose ? <View style={closeBox} /> : null}
          </View>
        </SkeletonBox>
      </Hug>
    );
  }

  const slop = (MIN_TOUCH - metrics.iconSize) / 2;
  const resolvedCloseLabel = closeLabel ?? (typeof children === "string" ? `${children} etiketini kaldır` : "Kaldır");

  return (
    <Hug style={style}>
      <View style={[geometry, colors.container, bordered && variant !== "outline" ? { borderColor: theme.color[color].border } : null]}>
        {icon}
        {label}
        {showClose ? (
          <Pressable
            onPress={onClose}
            hitSlop={slop}
            accessibilityRole="button"
            accessibilityLabel={resolvedCloseLabel}
            style={({ pressed }) => [closeBox, { alignItems: "center", justifyContent: "center", opacity: pressed ? 1 : 0.7 }]}
          >
            {closeIcon === true || closeIcon === undefined ? <XIcon size={metrics.iconSize - 2} color={iconColor} /> : closeIcon}
          </Pressable>
        ) : null}
      </View>
    </Hug>
  );
}
