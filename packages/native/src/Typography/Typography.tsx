import React, { createContext, useContext, useState } from "react";
import { Text as RNText, View, type StyleProp, type TextStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import { useNativeConfig, type NativeTextSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Hug } from "../lib/Hug";
import { SkeletonBox, SkeletonLine } from "../lib/Skeleton";
import type { ParagraphProps, TextProps, TextWeight, TitleProps, TypographyEllipsis } from "./types";

export type { ParagraphProps, TextProps, TextWeight, TitleProps, TitleLevel, TypographyEllipsis } from "./types";

const WEIGHT: Record<TextWeight, TextStyle["fontWeight"]> = { normal: "400", medium: "500", semibold: "600", bold: "700" };

/**
 * RN'de metin stili yalnız iç içe `<Text>` arasında miras kalır. İç içe bir
 * `Text` (ör. paragraf içinde kalın bir kelime) boyut/satır yüksekliğini
 * ebeveynden alsın diye kendi ölçeğini yazmaz — yalnız rengi/ağırlığı değiştirir.
 */
const InsideText = createContext(false);

function numberOfLines(ellipsis: TypographyEllipsis | undefined): number | undefined {
  if (!ellipsis) return undefined;
  return ellipsis === true ? 1 : ellipsis.rows;
}

function useTextColor(color: ColorRole | undefined, muted: boolean | undefined): string {
  const theme = useTheme();
  if (muted) return theme.color.canvas.muted;
  return color ? theme.color[color].text : theme.color.canvas.foreground;
}

/**
 * Metin zaten varsa görünmez olarak yerinde çizilir; satır sayısı onun gerçek
 * yüksekliğinden çıkar → hangi genişlikte olursa olsun yüklenince kayma yok.
 * Metin yoksa `rows` kadar satır.
 */
function ParagraphSkeleton({ metrics, rows, ellipsis, style, children }: Readonly<{ metrics: NativeTextSize; rows: number; ellipsis?: TypographyEllipsis; style?: StyleProp<TextStyle>; children?: React.ReactNode }>) {
  const [measured, setMeasured] = useState<number>();
  const count = Math.max(1, measured ?? Math.floor(rows));
  const lines = Array.from({ length: count }, (_, i) => <SkeletonLine key={i} fontSize={metrics.fontSize} lineHeight={metrics.lineHeight} width={i === count - 1 && count > 1 ? "60%" : "100%"} />);
  if (children == null) {
    return <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ alignSelf: "stretch" }}>{lines}</View>;
  }
  return (
    <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ alignSelf: "stretch" }}>
      <RNText
        numberOfLines={numberOfLines(ellipsis)}
        onLayout={(event) => setMeasured(Math.round(event.nativeEvent.layout.height / metrics.lineHeight))}
        style={[{ fontSize: metrics.fontSize, lineHeight: metrics.lineHeight }, style, { opacity: 0 }]}
      >
        {children}
      </RNText>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>{lines}</View>
    </View>
  );
}

export function Text({ children, color, weight, muted, ellipsis, skeleton = false, style, ...props }: Readonly<TextProps>) {
  const theme = useTheme();
  const metrics = useNativeConfig().typography.body;
  const nested = useContext(InsideText);
  const textColor = useTextColor(color, muted);
  const scale: TextStyle = nested ? {} : { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: metrics.fontSize, lineHeight: metrics.lineHeight };
  const textStyle: TextStyle = { ...scale, color: textColor, ...(weight ? { fontWeight: WEIGHT[weight] } : {}) };

  if (skeleton) {
    if (nested) return <RNText style={[textStyle, style, { color: "transparent" }]}>{children}</RNText>;
    // Metin varsa görünmez kalır → çubuk tam o genişlikte; yoksa makul bir kelime grubu genişliği.
    const bar = Math.round(metrics.fontSize * 0.7);
    return (
      <Hug>
        <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ maxWidth: "100%", minWidth: children == null ? 120 : undefined, height: metrics.lineHeight }}>
        <RNText numberOfLines={1} style={[textStyle, style, { opacity: 0 }]}>{children ?? " "}</RNText>
        <SkeletonBox style={{ position: "absolute", left: 0, right: 0, top: (metrics.lineHeight - bar) / 2, height: bar, borderRadius: 4 }} />
        </View>
      </Hug>
    );
  }

  return (
    <InsideText.Provider value>
      <RNText numberOfLines={numberOfLines(ellipsis)} {...props} style={[textStyle, style]}>
        {children}
      </RNText>
    </InsideText.Provider>
  );
}

export function Paragraph({ children, color, muted, ellipsis, skeleton = false, skeletonRows = 3, style, ...props }: Readonly<ParagraphProps>) {
  const theme = useTheme();
  const metrics = useNativeConfig().typography.body;
  const textColor = useTextColor(color, muted);

  if (skeleton) return <ParagraphSkeleton metrics={metrics} rows={skeletonRows} ellipsis={ellipsis} style={[{ fontFamily: nativeFontFamily(theme.fontFamily.sans) }, style]}>{children}</ParagraphSkeleton>;

  return (
    <InsideText.Provider value>
      <RNText
        numberOfLines={numberOfLines(ellipsis)}
        {...props}
        style={[{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, color: textColor }, style]}
      >
        {children}
      </RNText>
    </InsideText.Provider>
  );
}

export function Title({ level = 1, children, color, ellipsis, skeleton = false, style, ...props }: Readonly<TitleProps>) {
  const theme = useTheme();
  const metrics = useNativeConfig().typography[`h${level}`];
  const textColor = useTextColor(color, false);

  if (skeleton) {
    return (
      <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ alignSelf: "stretch" }}>
        <SkeletonLine fontSize={metrics.fontSize} lineHeight={metrics.lineHeight} width="40%" />
      </View>
    );
  }

  return (
    <InsideText.Provider value>
      <RNText
        accessibilityRole="header"
        numberOfLines={numberOfLines(ellipsis)}
        {...props}
        style={[{ fontFamily: nativeFontFamily(theme.fontFamily.heading ?? theme.fontFamily.sans), fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, fontWeight: "600", color: textColor }, style]}
      >
        {children}
      </RNText>
    </InsideText.Provider>
  );
}
