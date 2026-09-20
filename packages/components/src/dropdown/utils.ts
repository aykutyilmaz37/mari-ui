import { cn, resolveColorVariant, type ColorRole, type Variant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";
import type { Placement } from "./types";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

/** 12 değerli `Placement`i ana yön + hizaya ayırır (`bottom-end` → `{ side: "bottom", align: "end" }`). */
export function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split("-") as [Side, Align | undefined];
  return { side, align: align ?? "center" };
}

const OPPOSITE_SIDE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ArrowOptions {
  /** Okun ORTASININ panelin hizalandığı kenardan uzaklığı (ant.design: 12px kenar boşluğu + 8px yarım genişlik). */
  inset: number;
  /** `true`: panel, okun ortası TETİKLEYİCİNİN ortasına gelecek şekilde kayar (ant.design `arrow.pointAtCenter`). */
  pointAtCenter: boolean;
}

function getArrowCenter(align: Align, size: number, inset: number, towardsTrigger: number | undefined): number {
  if (towardsTrigger !== undefined) return towardsTrigger;
  if (align === "start") return inset;
  if (align === "end") return size - inset;
  return size / 2;
}

/**
 * Panelin sol-üst köşesinin (viewport koordinatlarında) nereye gelmesi
 * gerektiğini hesaplar: tercih edilen yönde sığmıyor ama karşı yönde
 * sığıyorsa yönü çevirir (flip), sonra iki eksende de viewport içinde
 * kelepçeler. `side` (flip sonrası gerçek yön) ve `arrowOffset` (okun ortasının
 * panelin kenarı boyunca konumu) da döner. Saf fonksiyon — DOM'a dokunmaz.
 */
export function computePanelPosition(
  anchor: Box,
  panel: { width: number; height: number },
  placement: Placement,
  viewport: { width: number; height: number },
  gap: number,
  edge: number,
  arrow?: ArrowOptions
): { top: number; left: number; side: Side; arrowOffset: number } {
  const { side: preferred, align } = parsePlacement(placement);

  const mainStart = (side: Side): number => {
    switch (side) {
      case "top":
        return anchor.top - gap - panel.height;
      case "bottom":
        return anchor.top + anchor.height + gap;
      case "left":
        return anchor.left - gap - panel.width;
      default:
        return anchor.left + anchor.width + gap;
    }
  };

  const fits = (side: Side): boolean => {
    const start = mainStart(side);
    const size = side === "top" || side === "bottom" ? panel.height : panel.width;
    const limit = side === "top" || side === "bottom" ? viewport.height : viewport.width;
    return start >= edge && start + size <= limit - edge;
  };

  const side = !fits(preferred) && fits(OPPOSITE_SIDE[preferred]) ? OPPOSITE_SIDE[preferred] : preferred;
  const vertical = side === "top" || side === "bottom";
  const inset = arrow?.inset ?? 0;

  // Çapraz eksen: panelin `size`ı, tetikleyicinin `start`/`length`i.
  const cross = vertical
    ? { start: anchor.left, length: anchor.width, size: panel.width }
    : { start: anchor.top, length: anchor.height, size: panel.height };
  const center = cross.start + cross.length / 2;

  let origin: number;
  if (align === "center") origin = center - cross.size / 2;
  else if (arrow?.pointAtCenter) origin = align === "start" ? center - inset : center + inset - cross.size;
  else origin = align === "start" ? cross.start : cross.start + cross.length - cross.size;

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
  const top = clamp(vertical ? mainStart(side) : origin, edge, viewport.height - panel.height - edge);
  const left = clamp(vertical ? origin : mainStart(side), edge, viewport.width - panel.width - edge);

  // Ok: varsayılan olarak hizalanan kenardan sabit `inset` içeride (ant.design);
  // `pointAtCenter` ise tetikleyicinin ortasında. Köşeye taşmasın diye kelepçelenir.
  const finalOrigin = vertical ? left : top;
  const arrowOffset = clamp(getArrowCenter(align, cross.size, inset, arrow?.pointAtCenter ? center - finalOrigin : undefined), inset, cross.size - inset);

  return { top, left, side, arrowOffset };
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
}

/** Renk/variant verilmemişse (eski `variant="none"` varsayılanı) düz, renksiz bir trigger döner. */
export function getTriggerClasses(color: ColorRole | undefined, variant: Variant | undefined): string {
  if (!color || !variant) return "";
  return cn(colorVariantToClassName(resolveColorVariant(color, variant)), "rounded-md px-3 py-1.5");
}
