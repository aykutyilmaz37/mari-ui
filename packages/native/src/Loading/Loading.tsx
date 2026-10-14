import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import type { ColorRole, Size } from "@mari-ui/core";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Hug } from "../lib/Hug";
import { overlaySurface, scrimColor } from "../lib/overlay";
import { clampPercent } from "../Progress/utils";

export interface LoadingProps {
  /** Varsayılan: `true`. */
  spinning?: boolean;
  /** sm 16 · md 20 · lg 36 (platform göstergesi). Varsayılan: `md`. */
  size?: Size;
  /** Göstergenin altında/yanında açıklama ("Siparişler yükleniyor"). */
  tip?: React.ReactNode;
  /** Bu kadar ms sonra görünür — hızlı biten işlemlerde yanıp sönmeyi önler. */
  delay?: number;
  /** Belirli ilerleme (0–100): dönen gösterge yerine dolan halka + yüzde. */
  percent?: number;
  /** Tüm ekranı kaplayan karartmalı katman. */
  fullscreen?: boolean;
  /** Verilirse içerik yerinde kalır, soluklaşır ve dokunmaya kapanır; gösterge üstünde. */
  children?: React.ReactNode;
  /** Varsayılan: `primary`. */
  color?: ColorRole;
  /** Halka izinin rengi (yalnız `percent`). Varsayılan: nötr yüzey. */
  trackColor?: ColorRole;
  /** Özel gösterge öğesi. */
  indicator?: React.ReactNode;
  /** Ekran okuyucu metni. Varsayılan: `tip` düz metinse o, değilse "Yükleniyor". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const RING = { sm: 16, md: 24, lg: 40 } as const;
const RING_STROKE = { sm: 2, md: 2.5, lg: 3.5 } as const;
const TIP_SIZE = { sm: 13, md: 15, lg: 17 } as const;

function useDelayedVisible(spinning: boolean, delay: number): boolean {
  const [ready, setReady] = useState(delay <= 0);
  useEffect(() => {
    if (!spinning || delay <= 0) {
      setReady(delay <= 0);
      return;
    }
    setReady(false);
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [spinning, delay]);
  return spinning && ready;
}

function Ring({ size, percent, fill, track }: Readonly<{ size: Size; percent: number; fill: string; track: string }>) {
  const box = RING[size];
  const stroke = RING_STROKE[size];
  const r = (box - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={box} height={box}>
      <G transform={`rotate(-90 ${box / 2} ${box / 2})`}>
        <Circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <Circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(clampPercent(percent) / 100) * c} ${c}`} />
      </G>
    </Svg>
  );
}

/** Belirsiz: platform göstergesi (HIG); belirli: dolan halka. */
function DefaultMark({ size, percent, fill, track }: Readonly<{ size: Size; percent?: number; fill: string; track: string }>) {
  if (percent !== undefined) return <Ring size={size} percent={percent} fill={fill} track={track} />;
  return <ActivityIndicator aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" size={size === "lg" ? "large" : "small"} color={fill} style={size === "sm" ? { transform: [{ scale: 0.8 }] } : undefined} />;
}

function Indicator({ size, color, trackColor, percent, tip, indicator, row }: Readonly<{ size: Size; color: ColorRole; trackColor?: ColorRole; percent?: number; tip?: React.ReactNode; indicator?: React.ReactNode; row: boolean }>) {
  const theme = useTheme();
  const fill = theme.color[color].solid;
  const mark = indicator ?? <DefaultMark size={size} percent={percent} fill={fill} track={trackColor ? theme.color[trackColor].subtle : theme.color.canvas.surfaceAlt} />;
  const textStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: TIP_SIZE[size], color: theme.color.canvas.muted };
  const value = percent === undefined ? null : <Text style={[textStyle, { fontWeight: "600", color: theme.color.canvas.foreground, fontVariant: ["tabular-nums"] }]}>{`%${Math.round(clampPercent(percent))}`}</Text>;
  return (
    <View style={{ flexDirection: row ? "row" : "column", alignItems: "center", gap: row ? 8 : 10 }}>
      {mark}
      {tip != null || value ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {typeof tip === "string" || typeof tip === "number" ? <Text style={textStyle}>{tip}</Text> : tip}
          {value}
        </View>
      ) : null}
    </View>
  );
}

function a11yFor(label: string, percent: number | undefined) {
  if (percent === undefined) return { accessible: true, accessibilityRole: "progressbar" as const, accessibilityLabel: label, accessibilityLiveRegion: "polite" as const, "aria-live": "polite" as const, "aria-busy": true };
  const now = Math.round(clampPercent(percent));
  return { accessible: true, accessibilityRole: "progressbar" as const, accessibilityLabel: label, accessibilityValue: { min: 0, max: 100, now }, "aria-valuenow": now, "aria-valuemin": 0, "aria-valuemax": 100 };
}

export function Loading({ spinning = true, size = "md", tip, delay = 0, percent, fullscreen = false, children, color = "primary", trackColor, indicator, accessibilityLabel, style }: Readonly<LoadingProps>) {
  const theme = useTheme();
  const visible = useDelayedVisible(spinning, delay);
  const label = accessibilityLabel ?? (typeof tip === "string" ? tip : "Yükleniyor");
  const block = <Indicator size={size} color={color} trackColor={trackColor} percent={percent} tip={tip} indicator={indicator} row={false} />;

  if (fullscreen) {
    return (
      <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
        <View {...a11yFor(label, percent)} style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: scrimColor(theme) }}>
          <View style={[overlaySurface(theme), { padding: 24, borderRadius: 16 }]}>{block}</View>
        </View>
      </Modal>
    );
  }

  if (children !== undefined) {
    // İçerik yerinde kalır (düzen kaymaz), soluklaşır ve dokunmaya kapanır; ekran okuyucu ona girmez.
    return (
      <View aria-busy={visible || undefined} accessibilityState={{ busy: visible }} style={style}>
        <View pointerEvents={visible ? "none" : "auto"} accessibilityElementsHidden={visible} aria-hidden={visible} importantForAccessibility={visible ? "no-hide-descendants" : "auto"} style={{ opacity: visible ? 0.4 : 1 }}>
          {children}
        </View>
        {visible ? (
          <View {...a11yFor(label, percent)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            {block}
          </View>
        ) : null}
      </View>
    );
  }

  if (!visible) return null;
  return (
    <Hug style={style}>
      <View {...a11yFor(label, percent)}>
        <Indicator size={size} color={color} trackColor={trackColor} percent={percent} tip={tip} indicator={indicator} row />
      </View>
    </Hug>
  );
}
