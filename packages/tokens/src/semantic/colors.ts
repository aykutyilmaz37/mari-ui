import { BLACK, WHITE } from "../primitives/ramps";
import {
  accentRamp,
  errorRamp,
  infoRamp,
  neutralRamp,
  primaryRamp,
  successRamp,
  warningRamp,
} from "../primitives/ramps";
import { deriveColorRole, type SemanticColorRole, type ThemeMode } from "./deriveColorRole";

/**
 * `neutral` kasıtlı olarak buraya dahil: "renksiz" bileşenler (nötr Tag,
 * varsayılan Badge) için de solid/subtle/text/border ihtiyacı var — bu
 * yüzden `neutral` diğer 6 rolle AYNI şekilde (nötr rampadan) türetilir,
 * özel durum olarak ele alınmaz. `resolveColorVariant("neutral", ...)` bu
 * sayede diğer rollerle birebir aynı kod yolunu izler.
 */
export type ColorRole = "primary" | "accent" | "success" | "error" | "warning" | "info" | "neutral";

/**
 * Sayfa yüzeyi token'ları — bir component'in `color` prop'undan bağımsız,
 * her zaman var olan zemin/metin/kenarlık değerleri. `neutral`'dan (bir
 * component'in ALABİLECEĞİ renk rollerinden biri) kasıtlı olarak ayrı
 * tutuluyor: `canvas.surface` sayfanın arka planı, `neutral` rolü ise "gri
 * görünsün" diye seçilen bir bileşen rengidir — ikisi aynı şey değildir.
 */
export interface CanvasTokens {
  surface: string;
  surfaceAlt: string;
  border: string;
  foreground: string;
  muted: string;
  disabled: string;
}

export interface SemanticColorTokens {
  primary: SemanticColorRole;
  accent: SemanticColorRole;
  success: SemanticColorRole;
  error: SemanticColorRole;
  warning: SemanticColorRole;
  info: SemanticColorRole;
  neutral: SemanticColorRole;
  canvas: CanvasTokens;
}

const LIGHT_SURFACE = WHITE;
const DARK_SURFACE = neutralRamp[950];

function buildCanvas(mode: ThemeMode): CanvasTokens {
  if (mode === "light") {
    return {
      surface: WHITE,
      surfaceAlt: neutralRamp[50],
      border: neutralRamp[200],
      foreground: neutralRamp[900],
      muted: neutralRamp[500],
      disabled: neutralRamp[300],
    };
  }
  return {
    surface: neutralRamp[950],
    surfaceAlt: neutralRamp[900],
    border: neutralRamp[700],
    foreground: neutralRamp[50],
    muted: neutralRamp[400],
    disabled: neutralRamp[700],
  };
}

/**
 * Tüm semantic renk rollerini bir tema modu için türetir. `warning` rolünün
 * `preferredSolidShade`i kasıtlı olarak 700'dür (diğerleri 600): amber-600
 * üzerinde beyaz metin ~3.19:1 kontrast verir ve AA'yı (4.5) geçemez —
 * amber-700 ile ~5.02:1'e çıkar. Bu, mevcut Button component'inin
 * `bg-warning text-white` kombinasyonunun aslında WCAG'yi geçmediğinin
 * (contrast.test.ts ile doğrulanan) somut kanıtıdır. `neutral` rolü de
 * aynı `deriveColorRole` fonksiyonundan geçer, sadece nötr rampayla.
 */
export function buildSemanticColors(mode: ThemeMode): SemanticColorTokens {
  const surface = mode === "light" ? LIGHT_SURFACE : DARK_SURFACE;
  return {
    primary: deriveColorRole(primaryRamp, surface, mode, 600),
    accent: deriveColorRole(accentRamp, surface, mode, 500),
    success: deriveColorRole(successRamp, surface, mode, 600),
    error: deriveColorRole(errorRamp, surface, mode, 600),
    warning: deriveColorRole(warningRamp, surface, mode, 700),
    info: deriveColorRole(infoRamp, surface, mode, 600),
    neutral: deriveColorRole(neutralRamp, surface, mode, 600),
    canvas: buildCanvas(mode),
  };
}

export { BLACK, WHITE };
