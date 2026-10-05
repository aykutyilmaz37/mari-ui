import Svg, { Circle, Path } from "react-native-svg";

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
