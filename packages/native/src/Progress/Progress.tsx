import React from "react";
import { Animated, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import type { ColorRole } from "@mari-ui/core";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { skeletonColor } from "../theme/skeletonColor";
import { CheckIcon, CircleCheckIcon, CircleXIcon, XIcon } from "../lib/icons";
import { usePulse, type SkeletonableProps } from "../lib/Skeleton";
import { Hug } from "../lib/Hug";
import { clampPercent, defaultProgressFormat, filledSteps, progressValueText, resolveProgressColor, resolveProgressStatus, type ProgressStatus } from "./utils";

export type { ProgressStatus };

export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps extends SkeletonableProps {
  /** 0–100. */
  percent?: number;
  type?: "line" | "circle";
  /** Verilmezse %100'de `success`. `active`: süren işlem (dolgu nabız atar). */
  status?: ProgressStatus;
  /** Varsayılan: `primary` (success/exception kendi rengini alır). */
  color?: ColorRole;
  /** Toplamın tamamlanmış (yeşil) kısmı, ör. yüklenen + işlenen. */
  success?: { percent: number };
  /** Çizgiyi bu kadar adıma böler. */
  steps?: number;
  /** Yüzde / durum ikonu. Varsayılan: `true`. */
  showInfo?: boolean;
  format?: (percent: number) => React.ReactNode;
  /** Çizgi 4/6/10 · daire 48/80/120. Varsayılan: `md`. */
  size?: ProgressSize;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const LINE = { sm: 4, md: 6, lg: 10 } as const;
const LINE_TEXT = { sm: 12, md: 13, lg: 15 } as const;
const CIRCLE = { sm: 48, md: 80, lg: 120 } as const;
const CIRCLE_STROKE = { sm: 10, md: 8, lg: 6 } as const;
const CIRCLE_TEXT = { sm: 12, md: 17, lg: 28 } as const;
const CIRCLE_ICON = { sm: 16, md: 28, lg: 40 } as const;

function Info({ status, percent, format, circle, size, tint, textStyle }: Readonly<{ status: ProgressStatus; percent: number; format: ProgressProps["format"]; circle: boolean; size: ProgressSize; tint: string; textStyle: object }>) {
  if (!format && (status === "success" || status === "exception")) {
    const Icon = circle ? { success: CheckIcon, exception: XIcon }[status] : { success: CircleCheckIcon, exception: CircleXIcon }[status];
    return <Icon size={circle ? CIRCLE_ICON[size] : 16} color={tint} />;
  }
  const value = (format ?? defaultProgressFormat)(percent);
  return typeof value === "string" || typeof value === "number" ? <Text style={textStyle}>{value}</Text> : <>{value}</>;
}

function CircleTrack({ percent, successPercent, size, fill, track, success }: Readonly<{ percent: number; successPercent: number; size: ProgressSize; fill: string; track: string; success: string }>) {
  const box = 100;
  const stroke = CIRCLE_STROKE[size];
  const r = (box - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = (p: number) => `${(p / 100) * c} ${c}`;
  return (
    <Svg width={CIRCLE[size]} height={CIRCLE[size]} viewBox={`0 0 ${box} ${box}`}>
      <G transform={`rotate(-90 ${box / 2} ${box / 2})`}>
        <Circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} stroke={track} />
        {percent > 0 ? <Circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={arc(percent)} stroke={fill} /> : null}
        {successPercent > 0 ? <Circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={arc(successPercent)} stroke={success} /> : null}
      </G>
    </Svg>
  );
}

interface BarProps {
  percent: number;
  successPercent: number;
  steps?: number;
  size: ProgressSize;
  fill: string;
  track: string;
  success: string;
  skeleton: boolean;
  active: boolean;
}

function LineBar({ percent, successPercent, steps, size, fill, track, success, skeleton, active }: Readonly<BarProps>) {
  const pulse = usePulse(active && !skeleton, 0.6);
  const height = LINE[size];
  if (steps) {
    const filled = skeleton ? 0 : filledSteps(percent, steps);
    return (
      <View style={{ flex: 1, flexDirection: "row", gap: 3 }}>
        {Array.from({ length: steps }, (_, i) => <View key={i} style={{ flex: 1, height, borderRadius: 2, backgroundColor: i < filled ? fill : track }} />)}
      </View>
    );
  }
  const segment = (width: number, color: string) => ({ position: "absolute" as const, left: 0, top: 0, bottom: 0, width: `${width}%` as const, borderRadius: height / 2, backgroundColor: color });
  return (
    <View style={{ flex: 1, height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }}>
      {skeleton ? null : <Animated.View style={[segment(percent, fill), { opacity: pulse }]} />}
      {!skeleton && successPercent > 0 ? <View style={segment(successPercent, success)} /> : null}
    </View>
  );
}

/** Yüzde metni: daire ortasında büyük ve kalın, çizgi yanında küçük; rakamlar eşit genişlikte. */
function infoTextStyle(fontFamily: string | undefined, color: string, circle: boolean, size: ProgressSize) {
  if (circle) return { fontFamily, color, fontSize: CIRCLE_TEXT[size], fontWeight: "600" as const, fontVariant: ["tabular-nums" as const] };
  return { fontFamily, color, fontSize: LINE_TEXT[size], fontVariant: ["tabular-nums" as const] };
}

function a11yProps(skeleton: boolean, label: string | undefined, percent: number, text: string) {
  if (skeleton) return { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const };
  const now = Math.round(percent);
  return {
    accessible: true,
    accessibilityRole: "progressbar" as const,
    accessibilityLabel: label,
    accessibilityValue: { min: 0, max: 100, now, text },
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": now,
    "aria-valuetext": text,
  };
}

export function Progress({ percent: rawPercent, type = "line", status: statusProp, color: colorProp, success, steps, showInfo = true, format, size = "md", accessibilityLabel, skeleton = false, style }: Readonly<ProgressProps>) {
  const theme = useTheme();
  const percent = clampPercent(rawPercent);
  const status = resolveProgressStatus(statusProp, percent);
  const color = resolveProgressColor(status, colorProp);
  // İskelette dolgu yok (iz iskelet tonunda), yalnız geometri.
  const shown = skeleton ? 0 : percent;
  const successPercent = success && !skeleton ? Math.min(clampPercent(success.percent), percent) : 0;
  const circle = type === "circle";
  const colors = { fill: theme.color[color].solid, track: skeleton ? skeletonColor(theme) : theme.color.canvas.surfaceAlt, success: theme.color.success.solid };
  const textStyle = infoTextStyle(nativeFontFamily(theme.fontFamily.sans), theme.color.canvas.foreground, circle, size);
  const a11y = a11yProps(skeleton, accessibilityLabel, percent, progressValueText(format?.(percent), percent, status));
  const info = showInfo ? <Info status={status} percent={percent} format={format} circle={circle} size={size} tint={theme.color[color].text} textStyle={textStyle} /> : null;

  if (circle) {
    // Daire içeriği kadar; yatay satırda ortalamayı bozmasın diye Hug.
    return (
      <Hug style={style}>
        <View {...a11y} style={{ width: CIRCLE[size], height: CIRCLE[size], alignItems: "center", justifyContent: "center" }}>
          <CircleTrack percent={shown} successPercent={successPercent} size={size} {...colors} />
          {info ? <View style={{ position: "absolute", opacity: skeleton ? 0 : 1 }}>{info}</View> : null}
        </View>
      </Hug>
    );
  }

  return (
    <View {...a11y} style={[{ flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "stretch" }, style]}>
      <LineBar percent={percent} successPercent={successPercent} steps={steps} size={size} {...colors} skeleton={skeleton} active={status === "active"} />
      {info ? <View style={{ minWidth: 36, alignItems: "flex-end", opacity: skeleton ? 0 : 1 }}>{info}</View> : null}
    </View>
  );
}
