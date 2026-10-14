import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import { bgSolidClass, borderStrongColorClass, checkedBgSolidClass, checkedBorderStrongClass } from "../lib/colorClasses";

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
