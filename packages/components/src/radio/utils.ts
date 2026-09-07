import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import { borderColorClass, textClass } from "../lib/colorClasses";
import type { LegacyRadioType } from "./types";

const LEGACY_TYPE_TO_COLOR: Record<LegacyRadioType, ColorRole> = {
  primary: "primary",
  secondary: "neutral",
};

/** Checkbox'takiyle aynı birleştirme: `status` (error/warning) artık ayrı bir eksen değil, `color`'ın kendisi. */
export function resolveRadioColor(props: { color?: ColorRole; status?: "error" | "warning"; type?: LegacyRadioType }): ColorRole {
  if (props.status) return props.status;
  if (props.color) return props.color;
  if (props.type) return LEGACY_TYPE_TO_COLOR[props.type];
  return "primary";
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

export function getVariantClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole): string {
  if (variant === "solid") return cn(SOLID_BG_CLASS[color], "border-transparent");
  return cn("border bg-mari-surface", borderColorClass[color], textClass[color]);
}

export function getVariantDotClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole): string {
  return variant === "solid" ? "bg-mari-surface" : SOLID_BG_CLASS[color];
}
