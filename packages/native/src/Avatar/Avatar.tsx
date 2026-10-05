import React, { Children, cloneElement, isValidElement, useState } from "react";
import { Image, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig, type NativeAvatarSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { Hug } from "../lib/Hug";
import { getInitials } from "./utils";

export type AvatarSize = number | Size;
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends SkeletonableProps {
  /** Erişilebilir ad; görsel yoksa baş harfler buradan türetilir. */
  alt?: string;
  icon?: React.ReactNode;
  shape?: AvatarShape;
  /** `sm` 32 · `md` 40 · `lg` 56 ya da pt. Varsayılan: `md`. */
  size?: AvatarSize;
  /** URL, `require(...)` görseli ya da hazır bir öğe. */
  src?: string | ImageSourcePropType | React.ReactElement;
  /** Görsel yokken zemin rengi (soft ton). Varsayılan: nötr yüzey. */
  color?: ColorRole;
  /** Görsel yüklenemedi. `false` dönerse yedek (baş harf/ikon) gösterilmez. */
  onError?: () => boolean | void;
  style?: StyleProp<ViewStyle>;
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  /** Bu sayıdan fazlası tek bir "+N" avatarında toplanır. */
  max?: number;
  /** Tüm avatarların boyutu (tek tek verilen `size`'ı ezmez). Varsayılan: `md`. */
  size?: AvatarSize;
  shape?: AvatarShape;
  skeleton?: boolean;
  style?: StyleProp<ViewStyle>;
}

function useAvatarMetrics(size: AvatarSize): NativeAvatarSize {
  const scale = useNativeConfig().avatar;
  if (typeof size !== "number") return scale[size];
  return { ...scale.md, size, fontSize: Math.round(size * 0.4) };
}

function useShapeStyle(shape: AvatarShape, metrics: NativeAvatarSize): ViewStyle {
  const theme = useTheme();
  return {
    width: metrics.size,
    height: metrics.size,
    borderRadius: shape === "circle" ? metrics.size / 2 : toPx(theme.radius[metrics.radius]),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  };
}

function toImageSource(src: AvatarProps["src"]): ImageSourcePropType | null {
  if (src == null || src === "" || isValidElement(src)) return null;
  if (typeof src === "string") return { uri: src };
  return src as ImageSourcePropType;
}

export function Avatar({ alt = "", icon, shape = "circle", size = "md", src, color, onError, skeleton = false, style }: AvatarProps) {
  const theme = useTheme();
  const metrics = useAvatarMetrics(size);
  const shapeStyle = useShapeStyle(shape, metrics);
  const [failed, setFailed] = useState(false);

  if (skeleton) return <SkeletonBox style={[shapeStyle, style]} />;

  const node = isValidElement(src) ? src : null;
  const source = node || failed ? null : toImageSource(src as AvatarProps["src"]);
  const tone = color ? { backgroundColor: theme.color[color].subtle, color: theme.color[color].subtleContrast } : { backgroundColor: theme.color.canvas.surfaceAlt, color: theme.color.canvas.muted };

  let content: React.ReactNode;
  if (source) {
    content = (
      <Image
        source={source}
        accessibilityIgnoresInvertColors
        onError={() => {
          if (onError?.() !== false) setFailed(true);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  } else if (node) content = node;
  else content = icon ?? <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: metrics.fontSize, fontWeight: "600", color: tone.color }}>{getInitials(alt)}</Text>;

  return (
    <View
      accessible={Boolean(alt)}
      accessibilityRole={alt ? "image" : undefined}
      accessibilityLabel={alt || undefined}
      accessibilityElementsHidden={!alt}
      importantForAccessibility={alt ? "yes" : "no-hide-descendants"}
      style={[shapeStyle, !source && { backgroundColor: tone.backgroundColor }, style]}
    >
      {content}
    </View>
  );
}

/** Üst üste binen avatarlar; her biri zemin renginde 2pt halkayla ayrışır. */
export function AvatarGroup({ children, max, size = "md", shape = "circle", skeleton, style }: AvatarGroupProps) {
  const theme = useTheme();
  const metrics = useAvatarMetrics(size);
  const shapeStyle = useShapeStyle(shape, metrics);
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<AvatarProps>[];
  const visible = max !== undefined && items.length > max ? items.slice(0, max) : items;
  const rest = items.length - visible.length;
  const ringRadius = shape === "circle" ? metrics.size / 2 + 2 : Number(shapeStyle.borderRadius) + 2;
  const ring = (index: number): ViewStyle => ({ borderWidth: 2, borderColor: theme.color.canvas.surface, borderRadius: ringRadius, marginLeft: index === 0 ? 0 : -metrics.overlap });

  let restNode: React.ReactNode = null;
  if (rest > 0) {
    restNode = skeleton ? (
      <SkeletonBox style={shapeStyle} />
    ) : (
      <View accessible accessibilityRole="image" accessibilityLabel={`${rest} kişi daha`} style={[shapeStyle, { backgroundColor: theme.color.canvas.surfaceAlt }]}>
        <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: metrics.fontSize, fontWeight: "600", color: theme.color.canvas.foreground }}>+{rest}</Text>
      </View>
    );
  }

  return (
    <Hug style={style}>
      <View accessibilityState={{ busy: Boolean(skeleton) }} aria-busy={Boolean(skeleton)} style={{ flexDirection: "row", alignItems: "center" }}>
        {visible.map((item, i) => (
          <View key={item.key ?? i} style={ring(i)}>
            {cloneElement(item, { size: item.props.size ?? size, shape: item.props.shape ?? shape, skeleton: item.props.skeleton ?? skeleton })}
          </View>
        ))}
        {restNode ? <View style={ring(visible.length)}>{restNode}</View> : null}
      </View>
    </Hug>
  );
}
