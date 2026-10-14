import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";

/*
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

export function XIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M18 6 6 18" {...s} />
      <Path d="m6 6 12 12" {...s} />
    </Svg>
  );
}

export function EyeIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" {...s} />
      <Circle cx={12} cy={12} r={3} {...s} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
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

export function PlusIcon({ size = 16, color = "currentColor", strokeWidth = 2 }: IconProps & { strokeWidth?: number }) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14" {...s} strokeWidth={strokeWidth} />
      <Path d="M12 5v14" {...s} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function SearchIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m21 21-4.34-4.34" {...s} />
      <Circle cx={11} cy={11} r={8} {...s} />
    </Svg>
  );
}

export function CircleCheckIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Path d="m16 9-5.5 5.5L8 12" {...s} />
    </Svg>
  );
}

export function InfoIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Path d="M12 16v-4" {...s} />
      <Path d="M12 8h.01" {...s} />
    </Svg>
  );
}

export function CircleAlertIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Line x1={12} x2={12} y1={8} y2={12} {...s} />
      <Line x1={12} x2={12.01} y1={16} y2={16} {...s} />
    </Svg>
  );
}

export function CircleXIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Path d="m15 9-6 6" {...s} />
      <Path d="m9 9 6 6" {...s} />
    </Svg>
  );
}

export function SparklesIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
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

export function ChevronDownIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m6 9 6 6 6-6" {...stroke(color)} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m9 18 6-6-6-6" {...stroke(color)} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m15 18-6-6 6-6" {...stroke(color)} />
    </Svg>
  );
}

export function ZoomInIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={8} {...s} />
      <Line x1={21} x2={16.65} y1={21} y2={16.65} {...s} />
      <Line x1={11} x2={11} y1={8} y2={14} {...s} />
      <Line x1={8} x2={14} y1={11} y2={11} {...s} />
    </Svg>
  );
}

export function ZoomOutIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={8} {...s} />
      <Line x1={21} x2={16.65} y1={21} y2={16.65} {...s} />
      <Line x1={8} x2={14} y1={11} y2={11} {...s} />
    </Svg>
  );
}

export function ImageOffIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={2} x2={22} y1={2} y2={22} {...s} />
      <Path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" {...s} />
      <Line x1={13.5} x2={6} y1={13.5} y2={21} {...s} />
      <Line x1={18} x2={21} y1={12} y2={15} {...s} />
      <Path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" {...s} />
      <Path d="M21 15V5a2 2 0 0 0-2-2H9" {...s} />
    </Svg>
  );
}

export function TrendingUpIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M16 7h6v6" {...s} />
      <Path d="m22 7-8.5 8.5-5-5L2 17" {...s} />
    </Svg>
  );
}

export function TrendingDownIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M16 17h6v-6" {...s} />
      <Path d="m22 17-8.5-8.5-5 5L2 7" {...s} />
    </Svg>
  );
}

export function PlayIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="6 3 20 12 6 21 6 3" {...stroke(color)} />
    </Svg>
  );
}

export function PauseIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={14} y={4} width={4} height={16} rx={1} {...s} />
      <Rect x={6} y={4} width={4} height={16} rx={1} {...s} />
    </Svg>
  );
}

export function RotateCcwIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" {...s} />
      <Path d="M3 3v5h5" {...s} />
    </Svg>
  );
}

/** Puan yıldızı — dolgu ve kontur ayrı (Rate). */
export function StarIcon({ size = 16, fill = "none", color = "currentColor", strokeWidth = 1.5 }: IconProps & { fill?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        {...stroke(color)}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </Svg>
  );
}

export function InboxIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="22 12 16 12 14 15 10 15 8 12 2 12" {...s} />
      <Path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" {...s} />
    </Svg>
  );
}

export function UploadIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3v12" {...s} />
      <Path d="m17 8-5-5-5 5" {...s} />
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...s} />
    </Svg>
  );
}

export function FileIcon({ size = 16, color = "currentColor" }: Readonly<IconProps>) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" {...s} />
      <Path d="M14 2v4a2 2 0 0 0 2 2h4" {...s} />
    </Svg>
  );
}
