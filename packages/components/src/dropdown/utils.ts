import { cn, resolveColorVariant, type ColorRole, type Variant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";

export { computePanelPosition, parsePlacement } from "../lib/floating";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
}

/** Renk/variant verilmemişse (eski `variant="none"` varsayılanı) düz, renksiz bir trigger döner. */
export function getTriggerClasses(color: ColorRole | undefined, variant: Variant | undefined): string {
  if (!color || !variant) return "";
  return cn(colorVariantToClassName(resolveColorVariant(color, variant)), "rounded-md px-3 py-1.5");
}
