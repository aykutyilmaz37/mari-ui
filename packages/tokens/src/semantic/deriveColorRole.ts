import type { HexColor } from "../contrast";
import { AA_TEXT_MIN, contrastRatio, meetsAA } from "../contrast";
import { BLACK, WHITE, type ColorRamp } from "../primitives/ramps";

export type ColorShade = keyof ColorRamp;
export type ThemeMode = "light" | "dark";

export interface SemanticColorRole {
  /** Sayfa yüzeyi üzerinde metin/ikon rengi — örn. "text-primary". */
  text: HexColor;
  /** Dolgulu (solid) bileşenlerin arka planı — örn. birincil buton. Temadan bağımsızdır. */
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

const SOLID_CANDIDATE_SHADES: ColorShade[] = [500, 600, 700, 800, 900];

/**
 * Metin/subtle aday tonları temaya göre TERS yönde aranır: açık temada sayfa
 * yüzeyi açık olduğu için koyu tonlar (600→900), koyu temada sayfa yüzeyi
 * koyu olduğu için açık tonlar (300→50) dener. Bu ayrım yapılmazsa (örn. her
 * iki temada da aynı "600" tonu kullanılırsa) koyu temada metin okunmaz hale
 * gelir — bugünkü `--text-base` / `.dark` tutarsızlığının kök nedeni tam
 * olarak buydu.
 */
const CANDIDATES: Record<ThemeMode, { textOnSurface: ColorShade[]; subtleBg: ColorShade; subtleText: ColorShade[] }> = {
  light: {
    textOnSurface: [600, 700, 800, 900],
    subtleBg: 50,
    subtleText: [700, 800, 900, 950],
  },
  dark: {
    textOnSurface: [300, 400, 200, 500],
    subtleBg: 950,
    subtleText: [100, 200, 300, 50],
  },
};

/**
 * Bir renk rampasından WCAG AA'yı **hesaplayarak** geçen semantic rol türetir.
 *
 * Var olma sebebi: mevcut sistemde "turuncu üzerine beyaz metin iyi görünür
 * mü" gibi kararlar göz kararıyla veriliyordu. Turuncu (accent, #F97316)
 * üzerinde beyaz metnin kontrast oranı ~2.8:1'dir — AA eşiği olan 4.5:1'in
 * çok altında. Bu fonksiyon `solid` tonu için önce beyaz metinle AA'yı
 * dener, geçmiyorsa koyu metin dener; turuncu accent için sonuç: `solid`
 * #F97316 olarak kalır ama `solidContrast` otomatik olarak koyu nötr bir
 * tona döner — kimse elle "beyaz mı siyah mı" diye karar vermez.
 */
export function deriveColorRole(
  ramp: ColorRamp,
  surface: HexColor,
  mode: ThemeMode,
  preferredSolidShade: ColorShade = 600
): SemanticColorRole {
  const { textOnSurface, subtleBg, subtleText } = CANDIDATES[mode];

  // --- solid + solidContrast: tema-bağımsız, sadece kendi foreground'una göre ---
  let solidShade: ColorShade = preferredSolidShade;
  let solidContrast: HexColor | undefined;
  const orderedSolidCandidates = [
    preferredSolidShade,
    ...SOLID_CANDIDATE_SHADES.filter((s) => s !== preferredSolidShade),
  ];
  for (const shade of orderedSolidCandidates) {
    const bg = ramp[shade];
    if (meetsAA(bg, WHITE)) {
      solidShade = shade;
      solidContrast = WHITE;
      break;
    }
    if (meetsAA(bg, BLACK)) {
      solidShade = shade;
      solidContrast = BLACK;
      break;
    }
  }
  const resolvedSolid = ramp[solidShade];
  if (!solidContrast) {
    solidContrast =
      contrastRatio(resolvedSolid, WHITE) >= contrastRatio(resolvedSolid, BLACK) ? WHITE : BLACK;
    console.warn(
      `[@mari-ui/tokens] Hiçbir "solid" aday AA eşiğini (${AA_TEXT_MIN}) geçemedi, en iyi seçenek kullanılıyor.`
    );
  }

  const solidIndex = shadeOrder.indexOf(solidShade);
  const hoverShade: ColorShade =
    shadeOrder[Math.min(solidIndex + 1, shadeOrder.length - 1)] ?? solidShade;

  // --- subtle + subtleContrast: temaya göre yön değiştirir ---
  const subtle = ramp[subtleBg];
  const subtleContrast =
    subtleText.map((s) => ramp[s]).find((c) => meetsAA(subtle, c)) ?? ramp[mode === "light" ? 900 : 50];

  // --- text: sayfa yüzeyi üzerinde okunabilir renk/ikon tonu ---
  const text =
    textOnSurface.map((s) => ramp[s]).find((c) => meetsAA(surface, c)) ?? ramp[mode === "light" ? 900 : 50];

  return {
    text,
    solid: resolvedSolid,
    solidContrast,
    solidHover: ramp[hoverShade],
    subtle,
    subtleContrast,
    border: ramp[mode === "light" ? 300 : 700],
  };
}
