import React from "react";
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import { useTheme } from "../theme/useTheme";
import { SkeletonBox } from "../lib/Skeleton";
import { Text } from "../Typography";
import type { SkeletonableProps } from "../lib/Skeleton";

export type DividerLineStyle = "solid" | "dashed" | "dotted";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerLabelAlign = "start" | "center" | "end";

export interface DividerProps extends SkeletonableProps {
  /** Yatay ayırıcının ortasındaki başlık. */
  children?: React.ReactNode;
  lineStyle?: DividerLineStyle;
  orientation?: DividerOrientation;
  labelAlign?: DividerLabelAlign;
  /** `labelAlign` start/end iken başlığın kenara uzaklığı (pt). Varsayılan: 24. */
  labelMargin?: number;
  /** `false` → başlık ön plan rengi + orta kalınlık. Varsayılan: `true` (ikincil). */
  plain?: boolean;
  /** Çevresindeki boşluk: sm 8 · md 16 · lg 24. Varsayılan: `md`. */
  size?: Size;
  /** Yalnız `orientation="vertical"`. Varsayılan: 20 (satır içi metin yüksekliği). */
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

const SPACING: Record<Size, number> = { sm: 8, md: 16, lg: 24 };

/**
 * Tek kenarlı kesik/noktalı çizgi iOS'ta çizilmez (RN yalnız dört kenar eşitken
 * destekler). Dört kenarı kesik bir kutu çizip taşanı kırpıyoruz → yalnız üst
 * (yatay) ya da sol (dikey) kenar görünür.
 */
function Line({ vertical, lineStyle, color, flex, length }: { vertical: boolean; lineStyle: DividerLineStyle; color: string; flex?: boolean; length?: DimensionValue }) {
  const along: ViewStyle = flex ? { flex: 1 } : { [vertical ? "height" : "width"]: length };
  if (lineStyle === "solid") {
    return <View style={[along, vertical ? { width: StyleSheet.hairlineWidth } : { height: StyleSheet.hairlineWidth }, { backgroundColor: color }]} />;
  }
  return (
    <View style={[along, vertical ? { width: 1 } : { height: 1 }, { overflow: "hidden" }]}>
      <View style={[vertical ? { width: 2, height: "100%" } : { height: 2, width: "100%" }, { borderWidth: 1, borderStyle: lineStyle, borderColor: color }]} />
    </View>
  );
}

const LABEL_TEXT = { fontSize: 15, lineHeight: 20, textAlign: "center" } as const;

/** Başlık: HIG Subheadline 15/20; düz metin değilse olduğu gibi çizilir. */
function Label({ children, skeleton, plain }: { children: React.ReactNode; skeleton: boolean; plain: boolean }) {
  if (skeleton) {
    return (
      <SkeletonBox style={{ borderRadius: 4 }}>
        <Text style={LABEL_TEXT}>{children}</Text>
      </SkeletonBox>
    );
  }
  if (typeof children !== "string" && typeof children !== "number") return <>{children}</>;
  return (
    <Text muted={plain} weight={plain ? undefined : "medium"} style={LABEL_TEXT}>
      {children}
    </Text>
  );
}

export function Divider({ children, lineStyle = "solid", orientation = "horizontal", labelAlign = "center", labelMargin = 24, plain = true, size = "md", height = 20, skeleton = false, style }: DividerProps) {
  const theme = useTheme();
  const spacing = SPACING[size];
  const color = theme.color.canvas.border;

  if (orientation === "vertical") {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ marginHorizontal: spacing * 0.75, alignSelf: "center" }, style]}>
        {skeleton ? <SkeletonBox style={{ width: 1, height }} /> : <Line vertical lineStyle={lineStyle} color={color} length={height} />}
      </View>
    );
  }

  const label = children == null ? null : <View style={{ paddingHorizontal: 12, flexShrink: 1 }}><Label skeleton={skeleton} plain={plain}>{children}</Label></View>;

  const line = (edge: "start" | "end") => {
    const fixed = labelAlign === edge && label != null;
    if (skeleton) return <SkeletonBox style={fixed ? { width: labelMargin, height: 1 } : { flex: 1, height: 1 }} />;
    return <Line vertical={false} lineStyle={lineStyle} color={color} flex={!fixed} length={fixed ? labelMargin : undefined} />;
  };

  // Ayırıcı görseldir; başlık (varsa) okunur — RN'de "separator" rolü yok.
  return (
    <View
      accessibilityElementsHidden={label == null || skeleton}
      importantForAccessibility={label == null || skeleton ? "no-hide-descendants" : "auto"}
      style={[{ flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginVertical: spacing }, style]}
    >
      {line("start")}
      {label}
      {label != null ? line("end") : null}
    </View>
  );
}
