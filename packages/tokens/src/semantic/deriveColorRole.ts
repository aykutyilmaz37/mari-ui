import type { HexColor } from "../contrast";
import { meetsAA, pickAccessibleForeground } from "../contrast";
import { BLACK, WHITE, type ColorRamp } from "../primitives/ramps";

export type ColorShade = keyof ColorRamp;
export type ThemeMode = "light" | "dark";

export interface SemanticColorRole {
  /** Sayfa yüzeyi üzerinde metin/ikon rengi — örn. "text-primary". */
  text: HexColor;
  /** Dolgulu (solid) bileşenlerin arka planı — örn. birincil buton. Temaya göre değişir. */
  solid: HexColor;
  /** `solid` arka plan üzerinde WCAG AA'yı geçen metin rengi. */
  solidContrast: HexColor;
  /** `solid`ın hover/active tonu — her zaman biraz daha belirgin. */
  solidHover: HexColor;
  /** Yumuşak (soft/subtle) arka plan — örn. seçili satır, bilgi kutusu. Temaya göre değişir. */
  subtle: HexColor;
  /** `subtle` arka plan üzerinde WCAG AA'yı geçen metin rengi. */
  subtleContrast: HexColor;
  /** Kenarlık rengi. */
  border: HexColor;
}

const shadeOrder: ColorShade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const DARK_INK: HexColor = "#201c19";

/**
 * Her modda yüzey, dolgu, hover, yumuşak zemin ve kenarlık için ayrı kontrast
 * kontrolü yapılır. Koyu temada açık dolgu + koyu metin kullanılır.
 */
export function deriveColorRole(
  ramp: ColorRamp,
  surface: HexColor,
  mode: ThemeMode,
  preferredSolidShade: ColorShade = mode === "light" ? 600 : 300,
  surfaceAlt: HexColor = surface
): SemanticColorRole {
  const solid = ramp[preferredSolidShade];
  // Beyazın yeterli olduğu dolguda beyazı koru; açık dolguda sıcak mürekkep.
  const solidContrast = pickAccessibleForeground(solid, [WHITE, DARK_INK, BLACK]);
  const solidIndex = shadeOrder.indexOf(preferredSolidShade);
  const hoverShades = solidContrast === WHITE
    ? shadeOrder.slice(solidIndex + 1)
    : shadeOrder.slice(0, solidIndex).reverse();
  const solidHover = hoverShades.map((shade) => ramp[shade]).find((color) => meetsAA(color, solidContrast)) ?? solid;
  const subtle = ramp[mode === "light" ? 100 : 900];
  const candidates = (mode === "light" ? [600, 700, 800, 900, 950] : [400, 300, 200, 100, 50]) as ColorShade[];
  const fallback = mode === "light" ? BLACK : WHITE;
  const colors = [...candidates.map((shade) => ramp[shade]), fallback];
  const text = colors.find((color) => [surface, surfaceAlt, subtle].every((bg) => meetsAA(bg, color))) ?? fallback;
  const subtleContrast = pickAccessibleForeground(subtle, colors);
  // İşlevsel kenarlık: hem sayfa hem renkli zemin üzerinde en az 3:1.
  const border = colors.find((color) => [surface, surfaceAlt, subtle].every((bg) => meetsAA(bg, color, 3))) ?? text;

  return { text, solid, solidContrast, solidHover, subtle, subtleContrast, border };
}
