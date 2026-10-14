import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass, bgSubtleClass, textSolidContrastClass, textSubtleContrastClass } from "../lib/colorClasses";
import type { TooltipVariant } from "./types";

/*
 * Balon STATİK: dolgu + üzerindeki kontrast metin, hover durumu YOK. Eskiden
 * butonlar için olan renk varyantı (`resolveColorVariant`) kullanılıyordu —
 * `hover:` arka planı taşıyordu; fare balonun üzerine gelince balon koyulaşıyor,
 * ayrı bir öğe olan ok ise eski renkte kalıyordu.
 */
export function getVariantClasses(color: ColorRole, variant: TooltipVariant): string {
  return variant === "soft" ? cn(bgSubtleClass[color], textSubtleContrastClass[color]) : cn(bgSolidClass[color], textSolidContrastClass[color]);
}

/** Ok balonun dolgusuyla birebir aynı sınıf. */
export function getArrowClasses(color: ColorRole, variant: TooltipVariant): string {
  return variant === "soft" ? bgSubtleClass[color] : bgSolidClass[color];
}
