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
  /*
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
  /**
   * Puan yıldızı dolgusu: `warning`'den BAĞIMSIZ,
   * parlak sarı. Sarı beyaz zeminde 3:1 veremeyeceği için yıldız ayrıca
   * `ratingStroke` konturu taşır — görünüm sarı, sınır erişilebilir.
   */
  rating: string;
  /** Yıldız konturu — varsayılan olarak dolguyla aynı; temalar ayrı bir kontur verebilir. */
  ratingStroke: string;
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
/*
 * Puan yıldızı sarısı — rol paletinden bağımsız sabit. Kullanıcı kararı
 * (2026-09-28): kontur DOLGUYLA AYNI renk — koyu konturlu denemeler (#a16207,
 * #b28903) görsel olarak beğenilmedi. Bilinen ödünleşim: açık zeminde yıldızın
 * sınır kontrastı 1.45:1 (WCAG 1.4.11 3:1'in altı); puan değeri ekran okuyucuya
 * metin olarak verilir (`aria-valuetext` / readOnly'de `aria-label`) ve boş
 * yıldızlar gri konturla ayrışır. Token ayrı tutuldu — tema bunu değiştirebilir.
 */
const RATING_YELLOW: HexColor = "#facc15";
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
      rating: RATING_YELLOW,
      ratingStroke: RATING_YELLOW,
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
    rating: RATING_YELLOW,
    ratingStroke: RATING_YELLOW,
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
    // Faz 15: açık temada 600 tonu beyaz metinle 4.5:1'i geçemiyor (success 3.8,
    // info 4.1) ve otomatik SİYAH metne düşüyordu — dolgulu başlık/rozet/switch
    // topu siyah görünüyordu. 700 tonu beyazla 5.5 / 5.9:1.
    success: deriveColorRole(rampOverrides.success ?? successRamp, surface, mode, mode === "light" ? 700 : 300, surfaceAlt),
    error: deriveColorRole(rampOverrides.error ?? errorRamp, surface, mode, undefined, surfaceAlt),
    // Faz 15 (kullanıcı kararı): warning dolgusu SARI (400) — 700 kahverengi-
    // turuncu görünüyordu. Sarı zeminde beyaz metin erişilebilir olamaz;
    // otomatik koyu mürekkep seçilir. Metin rengi (`text`) okunurluk için koyu amber kalır.
    warning: deriveColorRole(rampOverrides.warning ?? warningRamp, surface, mode, mode === "light" ? 400 : 300, surfaceAlt),
    info: deriveColorRole(rampOverrides.info ?? infoRamp, surface, mode, mode === "light" ? 700 : 300, surfaceAlt),
    neutral: deriveColorRole(rampOverrides.neutral ?? neutralRamp, surface, mode, undefined, surfaceAlt),
    canvas: { ...buildCanvas(mode), ring: primary.text },
  };
}

export { BLACK, WHITE };
