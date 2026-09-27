import { BLACK, WHITE } from "../primitives/ramps";
import type { ColorRamp } from "../primitives/ramps";
import {
  accentRamp,
  errorRamp,
  infoRamp,
  neutralRamp,
  primaryRamp,
  successRamp,
  warningRamp,
} from "../primitives/ramps";
import type { HexColor } from "../contrast";
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
  /**
   * Form alanı (input/textarea/select) kenarlığı. `border`den bilinçli olarak
   * AYRI: koyu temada saf-siyaha yakın bir yüzeyde `border` neredeyse görünmez
   * kalıyordu ("input kayboldu" — Faz 13 audit). `input` her iki temada da
   * yüzeye karşı belirgin daha yüksek kontrastlı bir tondur (shadcn'in
   * `--input` token'ıyla aynı amaç).
   */
  input: string;
  /** Klavye odak halkası rengi — primary tabanlı, yüzeyde net görünür. */
  ring: string;
  /**
   * Modal/Drawer arkasındaki karartma katmanı. Tek token — Modal `bg-black/50`,
   * Drawer `bg-black/30` kullanıyordu (tutarsız, token'sız). Hafif mor
   * tint taşır, saf siyah değil.
   */
  scrim: string;
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

const LIGHT_SURFACE = neutralRamp[50];
const DARK_SURFACE: HexColor = neutralRamp[950];

function buildCanvas(mode: ThemeMode): CanvasTokens {
  if (mode === "light") {
    return {
      surface: LIGHT_SURFACE,
      surfaceAlt: neutralRamp[100],
      border: neutralRamp[200],
      input: neutralRamp[400],
      ring: primaryRamp[600],
      scrim: "rgb(25 24 34 / 0.45)",
      foreground: neutralRamp[900],
      muted: neutralRamp[600],
      disabled: neutralRamp[300],
    };
  }
  return {
    surface: DARK_SURFACE,
    surfaceAlt: neutralRamp[900],
    border: neutralRamp[700],
    input: neutralRamp[500],
    ring: primaryRamp[400],
    scrim: "rgb(25 24 34 / 0.7)",
    foreground: neutralRamp[100],
    muted: neutralRamp[300],
    disabled: neutralRamp[700],
  };
}

/** Aynı renk sözleşmesi web, native ve tema stüdyosunda kullanılır. */
export function buildSemanticColors(mode: ThemeMode, rampOverrides: Partial<Record<ColorRole, ColorRamp>> = {}): SemanticColorTokens {
  const surface = mode === "light" ? LIGHT_SURFACE : DARK_SURFACE;
  const surfaceAlt = buildCanvas(mode).surfaceAlt as HexColor;
  const primary = deriveColorRole(rampOverrides.primary ?? primaryRamp, surface, mode, mode === "light" ? 600 : 400, surfaceAlt);
  return {
    primary,
    accent: deriveColorRole(rampOverrides.accent ?? accentRamp, surface, mode, undefined, surfaceAlt),
    success: deriveColorRole(rampOverrides.success ?? successRamp, surface, mode, undefined, surfaceAlt),
    error: deriveColorRole(rampOverrides.error ?? errorRamp, surface, mode, undefined, surfaceAlt),
    warning: deriveColorRole(rampOverrides.warning ?? warningRamp, surface, mode, mode === "light" ? 700 : 300, surfaceAlt),
    info: deriveColorRole(rampOverrides.info ?? infoRamp, surface, mode, undefined, surfaceAlt),
    neutral: deriveColorRole(rampOverrides.neutral ?? neutralRamp, surface, mode, undefined, surfaceAlt),
    canvas: { ...buildCanvas(mode), ring: primary.text },
  };
}

export { BLACK, WHITE };
