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
   * Drawer `bg-black/30` kullanıyordu (tutarsız, token'sız). Hafif blue-grey
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

const LIGHT_SURFACE = WHITE;
const DARK_SURFACE: HexColor = neutralRamp[950]; // #141d26 — palete özgü koyu, saf siyah değil

function buildCanvas(mode: ThemeMode): CanvasTokens {
  if (mode === "light") {
    return {
      surface: LIGHT_SURFACE,
      surfaceAlt: neutralRamp[50],
      border: neutralRamp[200],
      input: neutralRamp[300],
      ring: primaryRamp[500],
      scrim: "rgb(20 29 38 / 0.45)",
      foreground: neutralRamp[900],
      muted: neutralRamp[500],
      disabled: neutralRamp[300],
    };
  }
  return {
    surface: DARK_SURFACE,
    surfaceAlt: neutralRamp[900],
    border: neutralRamp[700],
    input: neutralRamp[600],
    ring: primaryRamp[400],
    scrim: "rgb(3 7 12 / 0.7)",
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
 *
 * `rampOverrides` (Faz 6 — tema stüdyosu): şemanın (`schema.json`)
 * `editable.color` alanı sadece `primary`/`accent`i düzenlenebilir işaretler
 * — bu yüzden stüdyo sadece bu iki rol için `generateRamp(anchor)` çıktısını
 * geçirir, ama imza herhangi bir rolü (hatta hepsini) geçersiz kılmaya izin
 * verecek kadar genel: gelecekte şema genişlerse burada değişiklik gerekmez.
 * Override VERİLMEZSE davranış birebir eskisiyle aynıdır (regresyon testi:
 * `colors.test.ts`).
 */
export function buildSemanticColors(mode: ThemeMode, rampOverrides: Partial<Record<ColorRole, ColorRamp>> = {}): SemanticColorTokens {
  const surface = mode === "light" ? LIGHT_SURFACE : DARK_SURFACE;
  return {
    primary: deriveColorRole(rampOverrides.primary ?? primaryRamp, surface, mode, 700),
    accent: deriveColorRole(rampOverrides.accent ?? accentRamp, surface, mode, 600),
    success: deriveColorRole(rampOverrides.success ?? successRamp, surface, mode, 600),
    error: deriveColorRole(rampOverrides.error ?? errorRamp, surface, mode, 600),
    warning: deriveColorRole(rampOverrides.warning ?? warningRamp, surface, mode, 700),
    info: deriveColorRole(rampOverrides.info ?? infoRamp, surface, mode, 600),
    neutral: deriveColorRole(rampOverrides.neutral ?? neutralRamp, surface, mode, 600),
    canvas: buildCanvas(mode),
  };
}

export { BLACK, WHITE };
