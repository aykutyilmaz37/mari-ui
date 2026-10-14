import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import {
  bgSolidClass,
  borderStrongColorClass,
  checkedBgSolidClass,
  checkedBgSolidHoverClass,
  checkedBorderSolidClass,
  textSolidContrastClass,
} from "../lib/colorClasses";
import type { CheckboxShape } from "./types";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-3 w-3 text-xs",
  md: "h-4 w-4 text-sm",
  lg: "h-5 w-5 text-base",
};

/** Çentik ikonu kutuyla orantılı — eskiden her boyutta sabit 16px'ti (sm'nin 12px kutusundan taşıyordu). */
const CHECK_ICON_CLASS: Record<Size, string> = {
  sm: "size-2.5",
  md: "size-3",
  lg: "size-3.5",
};

/** Belirsiz (indeterminate) hal: dolu kutunun ortasında yatay bir çizgi. */
const INDETERMINATE_SIZE_CLASS: Record<Size, string> = {
  sm: "h-0.5 w-1.5",
  md: "h-0.5 w-2",
  lg: "h-0.5 w-2.5",
};

export function getSizeClasses(size: Size): string {
  return SIZE_CLASS[size];
}

export function getIndeterminateSizeClasses(size: Size): string {
  return INDETERMINATE_SIZE_CLASS[size];
}

export function getCheckIconClass(size: Size): string {
  return CHECK_ICON_CLASS[size];
}

export function getShapeClasses(shape: CheckboxShape): string {
  // `pill` eskiden `px-4` da taşıyordu — 16px'lik kutu 34px'lik bir ovale dönüşüyordu.
  // Kutu köşesi, kontrol ölçeğinde (`rounded-sm`), radius preset'ini izler.
  return { square: "rounded-none", pill: "rounded-full", default: "rounded-sm" }[shape];
}

/**
 * `color` verilmediyse (yani gerçek bir doğrulama durumu YOKSA) dinlenme
 * halindeki (işaretsiz) kenarlık nötr/gri (`border-mari-input`) — sadece
 * işaretlenince `primary`e (veya AÇIKÇA verilen renge) bürünür. `color`
 * AÇIKÇA verildiyse (örn. `error`) o renk işaretli/işaretsiz HER ZAMAN
 * kalıcıdır (bkz. `input/utils.ts`'teki aynı desen).
 */
export function getVariantClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole | undefined, indeterminate = false): string {
  const fillColor = color ?? "primary";
  // Belirsiz hal native `checked` DEĞİL — eskiden hiçbir dolgu almıyordu, iç
  // çubuk da yüzey renginde olduğu için kutu BOŞ görünüyordu.
  const indeterminateClass = indeterminate && cn(bgSolidClass[fillColor], "border-transparent");
  if (variant === "solid") {
    return cn("border-transparent bg-mari-surface-alt", checkedBgSolidClass[fillColor], checkedBgSolidHoverClass[fillColor], indeterminateClass);
  }
  // Açıkça verilen renk (doğrulama durumu) dinlenmede de rol renginde (≥3:1).
  const restBorderClass = color ? borderStrongColorClass[color] : "border-mari-input";
  return cn("bg-mari-surface", restBorderClass, checkedBgSolidClass[fillColor], checkedBorderSolidClass[fillColor], textSolidContrastClass[fillColor], indeterminateClass);
}
