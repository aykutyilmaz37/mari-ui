import { cn, resolveColorVariant, type ColorRole, type Variant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";
import type { Placement } from "./types";

export function getPlacementClass(placement: Placement): string {
  switch (placement) {
    case "bottom":
      return "top-full left-1/2 -translate-x-1/2";
    case "top":
      return "bottom-full left-1/2 -translate-x-1/2";
    case "right":
      return "left-full top-0 -translate-y-10";
    case "left":
      return "right-full top-0 -translate-y-10";
    default:
      return "top-full left-1/2 -translate-x-1/2";
  }
}

/** Renk/variant verilmemişse (eski `variant="none"` varsayılanı) düz, renksiz bir trigger döner. */
export function getTriggerClasses(color: ColorRole | undefined, variant: Variant | undefined): string {
  if (!color || !variant) return "";
  return cn(colorVariantToClassName(resolveColorVariant(color, variant)), "rounded-md px-3 py-1.5");
}
