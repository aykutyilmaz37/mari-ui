import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import { bgSolidClass, borderStrongColorClass, checkedBgSolidClass, checkedBorderStrongClass } from "../lib/colorClasses";
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

/**
 * `color` verilmediyse dinlenme halindeki (seçilmemiş) kenarlık nötr/gri
 * (`border-mari-input`) — sadece seçilince rol rengine bürünür.
 *
 * Faz 15: `solid` varyantında dolgu `checked:` önekisizdi — SEÇİLMEMİŞ radio
 * da tamamen dolu çiziliyor, bir grupta hepsi seçili görünüyordu. Açıkça
 * verilen renk (doğrulama) ve seçili halka rol renginde (açık `-border` tonu <3:1).
 */
export function getVariantClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole | undefined): string {
  const fillColor = color ?? "primary";
  const restBorderClass = color ? borderStrongColorClass[color] : "border-mari-input";
  if (variant === "solid") return cn("border bg-mari-surface-alt", restBorderClass, checkedBgSolidClass[fillColor], "checked:border-transparent");
  return cn("border bg-mari-surface", restBorderClass, checkedBorderStrongClass[fillColor]);
}

export function getVariantDotClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole | undefined): string {
  const fillColor = color ?? "primary";
  return variant === "solid" ? "bg-mari-surface" : bgSolidClass[fillColor];
}
