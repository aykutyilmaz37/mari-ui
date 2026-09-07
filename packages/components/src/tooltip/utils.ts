import type { Placement } from "@mari-ui/core";
import { cn, resolveColorVariant, type ColorRole } from "@mari-ui/core";
import { colorVariantToClassName, fillSolidClass, strokeSolidClass } from "../lib/colorClasses";

export function getVariantClasses(color: ColorRole): string {
  return colorVariantToClassName(resolveColorVariant(color, "solid"));
}

export function getArrowClasses(color: ColorRole): string {
  return cn(fillSolidClass[color], strokeSolidClass[color]);
}

/** 12 değerli `Placement`i bu component'in desteklediği 4 ana yöne indirger. */
export function toBaseDirection(placement: Placement): "top" | "bottom" | "left" | "right" {
  if (placement.startsWith("top")) return "top";
  if (placement.startsWith("bottom")) return "bottom";
  if (placement.startsWith("left")) return "left";
  return "right";
}
