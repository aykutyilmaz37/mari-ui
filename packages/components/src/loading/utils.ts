import type { ColorRole, Size } from "@mari-ui/core";

/** SVG `stroke` rengi — Tailwind tarayıcısı için literal (bkz. lib/colorClasses). */
export const strokeClass: Record<ColorRole, string> = {
  primary: "stroke-mari-primary",
  accent: "stroke-mari-accent",
  success: "stroke-mari-success",
  error: "stroke-mari-error",
  warning: "stroke-mari-warning",
  info: "stroke-mari-info",
  neutral: "stroke-mari-neutral",
};

/**
 * SVG'nin iç koordinat sistemi (viewBox birimi) — ekrandaki boyut `SPINNER_SIZE`.
 * Faz 15.6: eskiden `width/height` bu sayılarla px'ti; kök font büyüyünce
 * (4K, erişilebilirlik yazı boyutu) spinner küçük kalıyordu (px yasak kuralı).
 */
export const SPINNER_VIEWBOX: Record<Size, number> = { sm: 16, md: 24, lg: 40 };
export const SPINNER_SIZE: Record<Size, string> = { sm: "1rem", md: "1.5rem", lg: "2.5rem" };
/** Halka kalınlığı (viewBox birimi) çapla birlikte — küçükte ince çizgi kaybolmasın. */
export const STROKE_WIDTH: Record<Size, number> = { sm: 2, md: 2.5, lg: 3.5 };
export const TIP_CLASS: Record<Size, string> = { sm: "text-xs", md: "text-sm", lg: "text-base" };

export function clampPercent(percent: number | undefined): number {
  return Math.min(100, Math.max(0, percent ?? 0));
}
