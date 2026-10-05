import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";

/**
 * Paketin kendi iç ikonları — lucide'ın (web'de kullanılan) BİREBİR aynı
 * çizimleri; tüketicinin lucide kurmasına gerek yok. 24'lük görünüm kutusu,
 * 2 kalınlık, yuvarlak uçlar (lucide varsayılanı). `react-native-svg` peer
 * bağımlılığı (Expo'da hazır) — kullanıcı kararı 2026-10-05.
 */
interface IconProps {
  size?: number;
  color?: string;
}

const stroke = (color: string) => ({ stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" });

export function XIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M18 6 6 18" {...s} />
      <Path d="m6 6 12 12" {...s} />
    </Svg>
  );
}

export function EyeIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" {...s} />
      <Circle cx={12} cy={12} r={3} {...s} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" {...s} />
      <Path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" {...s} />
      <Path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" {...s} />
      <Path d="m2 2 20 20" {...s} />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = "currentColor", strokeWidth = 3 }: IconProps & { strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" {...stroke(color)} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function MinusIcon({ size = 16, color = "currentColor", strokeWidth = 3 }: IconProps & { strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14" {...stroke(color)} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function SearchIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m21 21-4.34-4.34" {...s} />
      <Circle cx={11} cy={11} r={8} {...s} />
    </Svg>
  );
}

export function CircleCheckIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Path d="m16 9-5.5 5.5L8 12" {...s} />
    </Svg>
  );
}

export function InfoIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Path d="M12 16v-4" {...s} />
      <Path d="M12 8h.01" {...s} />
    </Svg>
  );
}

export function CircleAlertIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Line x1={12} x2={12} y1={8} y2={12} {...s} />
      <Line x1={12} x2={12.01} y1={16} y2={16} {...s} />
    </Svg>
  );
}

export function CircleXIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Path d="m15 9-6 6" {...s} />
      <Path d="m9 9 6 6" {...s} />
    </Svg>
  );
}

export function SparklesIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" {...s} />
      <Path d="M20 2v4" {...s} />
      <Path d="M22 4h-4" {...s} />
      <Circle cx={4} cy={20} r={2} {...s} />
    </Svg>
  );
}

export function InboxIcon({ size = 16, color = "currentColor" }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="22 12 16 12 14 15 10 15 8 12 2 12" {...s} />
      <Path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" {...s} />
    </Svg>
  );
}
