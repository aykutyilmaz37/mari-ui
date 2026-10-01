import type { FloatButtonPlacement } from "./types";

/**
 * Faz 16.6 — FloatButton'ın saf yardımcıları. Konum: ekranın köşesine
 * sabit, kenardan 1.5rem; çentikli telefonlarda güvenli alan (safe-area)
 * eklenir — düğme ana ekran çubuğunun altında kalmasın.
 */
export const PLACEMENT_CLASS: Record<FloatButtonPlacement, string> = {
  "bottom-right": "right-[calc(1.5rem+env(safe-area-inset-right))] bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
  "bottom-left": "left-[calc(1.5rem+env(safe-area-inset-left))] bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
  "top-right": "right-[calc(1.5rem+env(safe-area-inset-right))] top-[calc(1.5rem+env(safe-area-inset-top))]",
  "top-left": "left-[calc(1.5rem+env(safe-area-inset-left))] top-[calc(1.5rem+env(safe-area-inset-top))]",
};

/** Menü hangi yöne açılır: alttaki grup yukarı, üstteki aşağı. */
export const opensUpward = (placement: FloatButtonPlacement) => placement.startsWith("bottom");

/** BackTop görünürlüğü. */
export const shouldShowBackTop = (scrollTop: number, visibilityHeight: number) => scrollTop >= visibilityHeight;

/** Başa döndükten sonra odaklanacak öğe: ilk h1 → main → kök. */
export function defaultFocusTarget(root: HTMLElement | Document): HTMLElement | null {
  const scope = root instanceof Document ? root.body : root;
  return scope.querySelector<HTMLElement>("h1") ?? scope.querySelector<HTMLElement>("main, [role=main]") ?? (root instanceof Document ? null : root);
}
