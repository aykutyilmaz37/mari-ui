import type { Placement } from "@mari-ui/core";
import { cn, resolveColorVariant, type ColorRole } from "@mari-ui/core";
import { colorVariantToClassName, fillSolidClass, fillSubtleClass, strokeSolidClass, strokeSubtleClass } from "../lib/colorClasses";
import type { TooltipVariant } from "./types";

export function getVariantClasses(color: ColorRole, variant: TooltipVariant): string {
  return colorVariantToClassName(resolveColorVariant(color, variant));
}

/** Ok işareti balonun arka planıyla eşleşsin diye aynı varyantı kullanır. */
export function getArrowClasses(color: ColorRole, variant: TooltipVariant): string {
  return variant === "soft" ? cn(fillSubtleClass[color], strokeSubtleClass[color]) : cn(fillSolidClass[color], strokeSolidClass[color]);
}

/** 12 değerli `Placement`i bu component'in desteklediği 4 ana yöne indirger. */
export function toBaseDirection(placement: Placement): "top" | "bottom" | "left" | "right" {
  if (placement.startsWith("top")) return "top";
  if (placement.startsWith("bottom")) return "bottom";
  if (placement.startsWith("left")) return "left";
  return "right";
}
