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

export const SPINNER_PX: Record<Size, number> = { sm: 16, md: 24, lg: 40 };
/** Halka kalınlığı çapla birlikte — küçükte ince çizgi kaybolmasın. */
export const STROKE_PX: Record<Size, number> = { sm: 2, md: 2.5, lg: 3.5 };
export const TIP_CLASS: Record<Size, string> = { sm: "text-xs", md: "text-sm", lg: "text-base" };
