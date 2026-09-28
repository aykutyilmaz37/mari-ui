import { cn, resolveColorVariant, type ColorRole, type Variant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";

export { computePanelPosition, parsePlacement } from "../lib/floating";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
}

/**
 * Faz 15.5 — panel içi klavye gezinmesi (APG "menu button" tuş modeli). İçerik
 * keyfi olabildiği için `role="menu"` verilmez; ama odaklanabilir öğeler
 * arasında ↑/↓ (sarar), Home/End ve harfle atlama (başlığı o harfle başlayan
 * sonraki öğe) çalışır. Hedef öğeyi döner, tuş bu modele ait değilse `null`.
 */
export function getRovingTarget(items: HTMLElement[], current: Element | null, key: string): HTMLElement | null {
  if (items.length === 0) return null;
  const index = current ? items.indexOf(current as HTMLElement) : -1;
  switch (key) {
    case "ArrowDown":
      return items[(index + 1) % items.length] ?? null;
    case "ArrowUp":
      return items[index <= 0 ? items.length - 1 : index - 1] ?? null;
    case "Home":
      return items[0] ?? null;
    case "End":
      return items[items.length - 1] ?? null;
    default: {
      if (key.length !== 1 || key === " ") return null;
      const char = key.toLocaleLowerCase("tr");
      for (let step = 1; step <= items.length; step++) {
        const candidate = items[(index + step) % items.length];
        if (candidate?.textContent?.trim().toLocaleLowerCase("tr").startsWith(char)) return candidate;
      }
      return null;
    }
  }
}

/** Renk/variant verilmemişse (eski `variant="none"` varsayılanı) düz, renksiz bir trigger döner. */
export function getTriggerClasses(color: ColorRole | undefined, variant: Variant | undefined): string {
  if (!color || !variant) return "";
  return cn(colorVariantToClassName(resolveColorVariant(color, variant)), "rounded-md px-3 py-1.5");
}
