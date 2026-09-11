import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import { borderColorClass, textClass } from "../lib/colorClasses";
import type { LegacyRadioType } from "./types";

const LEGACY_TYPE_TO_COLOR: Record<LegacyRadioType, ColorRole> = {
  primary: "primary",
  secondary: "neutral",
};

/**
 * Checkbox'takiyle aynı birleştirme: `status` (error/warning) artık ayrı bir
 * eksen değil, `color`'ın kendisi. `undefined` dönebilir — "renk AÇIKÇA
 * verilmedi" ile "primary açıkça seçildi" ayrımı korunur (bkz. checkbox/utils.ts).
 */
export function resolveRadioColor(props: { color?: ColorRole; status?: "error" | "warning"; type?: LegacyRadioType }): ColorRole | undefined {
  if (props.status) return props.status;
  if (props.color) return props.color;
  if (props.type) return LEGACY_TYPE_TO_COLOR[props.type];
  return undefined;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "w-3 h-3 text-sm",
  md: "w-4 h-4 text-base",
  lg: "w-5 h-5 text-lg",
};

const DOT_SIZE_CLASS: Record<Size, string> = {
  sm: "w-1 h-1",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export function getSizeClasses(size: Size): string {
  return SIZE_CLASS[size];
}

export function getDotSizeClasses(size: Size): string {
  return DOT_SIZE_CLASS[size];
}

// Literal tablolar — bkz. checkbox/utils.ts'teki not: `checked:` gibi
// pseudo-class önekleri çalışma zamanı string birleştirmesiyle DEĞİL, tam
// literal olarak yazılır.
const SOLID_BG_CLASS: Record<ColorRole, string> = {
  primary: "bg-mari-primary-solid",
  accent: "bg-mari-accent-solid",
  success: "bg-mari-success-solid",
  error: "bg-mari-error-solid",
  warning: "bg-mari-warning-solid",
  info: "bg-mari-info-solid",
  neutral: "bg-mari-neutral-solid",
};

/** Sadece İŞARETLİYKEN kenarlığı renklendirir — dinlenme halinde nötr/gri kalır. */
const CHECKED_BORDER_CLASS: Record<ColorRole, string> = {
  primary: "checked:border-mari-primary-border",
  accent: "checked:border-mari-accent-border",
  success: "checked:border-mari-success-border",
  error: "checked:border-mari-error-border",
  warning: "checked:border-mari-warning-border",
  info: "checked:border-mari-info-border",
  neutral: "checked:border-mari-neutral-border",
};

/**
 * `color` verilmediyse dinlenme halindeki (seçilmemiş) kenarlık nötr/gri
 * (`border-mari-input`) — sadece seçilince `primary`e (veya açıkça verilen
 * renge) bürünür (bkz. checkbox/utils.ts'teki aynı desen).
 */
export function getVariantClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole | undefined): string {
  const fillColor = color ?? "primary";
  if (variant === "solid") return cn(SOLID_BG_CLASS[fillColor], "border-transparent");
  const restBorderClass = color ? borderColorClass[color] : "border-mari-input";
  return cn("border bg-mari-surface", restBorderClass, CHECKED_BORDER_CLASS[fillColor], textClass[fillColor]);
}

export function getVariantDotClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole | undefined): string {
  const fillColor = color ?? "primary";
  return variant === "solid" ? "bg-mari-surface" : SOLID_BG_CLASS[fillColor];
}
