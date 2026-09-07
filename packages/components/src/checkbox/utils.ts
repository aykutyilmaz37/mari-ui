import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import { borderColorClass, textSolidContrastClass } from "../lib/colorClasses";
import type { CheckboxShape, LegacyCheckboxType } from "./types";

const LEGACY_TYPE_TO_COLOR: Record<LegacyCheckboxType, ColorRole> = {
  primary: "primary",
  secondary: "neutral",
};

/**
 * Eskiden `status` (error/warning) ve `type` (primary/secondary) İKİ AYRI
 * eksendi ve `status` varsa `type`'ın renk sınıfları TAMAMEN atlanıyordu.
 * `error`/`warning` zaten birer `ColorRole` olduğu için tek eksene
 * indirgendi: `status` verilmişse o `color` olarak kullanılır.
 */
export function resolveCheckboxColor(props: {
  color?: ColorRole;
  status?: "error" | "warning";
  type?: LegacyCheckboxType;
}): ColorRole {
  if (props.status) return props.status;
  if (props.color) return props.color;
  if (props.type) return LEGACY_TYPE_TO_COLOR[props.type];
  return "primary";
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-3 w-3 text-xs",
  md: "h-4 w-4 text-sm",
  lg: "h-5 w-5 text-base",
};

const INDETERMINATE_SIZE_CLASS: Record<Size, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function getSizeClasses(size: Size): string {
  return SIZE_CLASS[size];
}

export function getIndeterminateSizeClasses(size: Size): string {
  return INDETERMINATE_SIZE_CLASS[size];
}

export function getShapeClasses(shape: CheckboxShape): string {
  return { square: "rounded-none", pill: "rounded-full px-4", default: "rounded-md" }[shape];
}

/**
 * `checked:` pseudo-class varyantları — literal string, `${role}`
 * interpolasyonu YOK. `colorClasses.ts`'teki tablolar zaten "hover:" önekli
 * geliyor; onları çalışma zamanında `.replace()` edip yeniden birleştirmek
 * ("checked:" + temizlenmiş sonuç) Tailwind'in tarayıcısının asla
 * göremeyeceği bir string üretirdi — Skeleton/Loading'i bozan hatanın
 * üçüncü tekrarı olurdu. Bunun yerine ayrı, tam literal bir tablo.
 */
const CHECKED_BG_SOLID_CLASS: Record<ColorRole, string> = {
  primary: "checked:bg-mari-primary-solid",
  accent: "checked:bg-mari-accent-solid",
  success: "checked:bg-mari-success-solid",
  error: "checked:bg-mari-error-solid",
  warning: "checked:bg-mari-warning-solid",
  info: "checked:bg-mari-info-solid",
  neutral: "checked:bg-mari-neutral-solid",
};

const CHECKED_BG_SOLID_HOVER_CLASS: Record<ColorRole, string> = {
  primary: "checked:hover:bg-mari-primary-solid-hover",
  accent: "checked:hover:bg-mari-accent-solid-hover",
  success: "checked:hover:bg-mari-success-solid-hover",
  error: "checked:hover:bg-mari-error-solid-hover",
  warning: "checked:hover:bg-mari-warning-solid-hover",
  info: "checked:hover:bg-mari-info-solid-hover",
  neutral: "checked:hover:bg-mari-neutral-solid-hover",
};

export function getVariantClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole): string {
  if (variant === "solid") {
    return cn(CHECKED_BG_SOLID_CLASS[color], CHECKED_BG_SOLID_HOVER_CLASS[color], "border-transparent bg-mari-surface-alt");
  }
  return cn("bg-mari-surface", borderColorClass[color], CHECKED_BG_SOLID_CLASS[color], textSolidContrastClass[color]);
}
