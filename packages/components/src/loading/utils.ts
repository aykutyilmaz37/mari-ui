import type { ColorRole } from "@mari-ui/core";

/**
 * Eskiden `` `fill-${line}` `` ve `` `text-${circle}` `` şeklinde çalışma
 * zamanında üretiliyordu — Tailwind'in tarayıcısı bunu asla göremezdi,
 * component GÖRSEL OLARAK BOZUKTU (bkz. plan Faz 3, orijinal denetimin
 * en somut üç örneğinden biri: Skeleton ve Tag ile birlikte). Literal
 * tablo ile düzeltildi.
 */
export const fillClass: Record<ColorRole, string> = {
  primary: "fill-mari-primary",
  accent: "fill-mari-accent",
  success: "fill-mari-success",
  error: "fill-mari-error",
  warning: "fill-mari-warning",
  info: "fill-mari-info",
  neutral: "fill-mari-neutral",
};

export const textColorClass: Record<ColorRole, string> = {
  primary: "text-mari-primary",
  accent: "text-mari-accent",
  success: "text-mari-success",
  error: "text-mari-error",
  warning: "text-mari-warning",
  info: "text-mari-info",
  neutral: "text-mari-neutral",
};
