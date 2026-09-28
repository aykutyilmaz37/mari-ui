"use client";

import { useEffect, useState, type RefObject } from "react";
import type { Placement } from "@mari-ui/core";
import { computePanelPosition, type ArrowOptions, type Side } from "./floating";

export interface FloatingCoords {
  top: number;
  left: number;
  side: Side;
  arrowOffset: number;
  /** Üst/alt yönlerde tetikleyicinin genişliği (panel en az o kadar geniş olur); yanlarda `undefined`. */
  anchorWidth: number | undefined;
}

export interface FloatingOptions {
  placement: Placement;
  /** Tetikleyici ile panel arası (px). */
  gap: number;
  /** Panelin viewport kenarından en az uzaklığı (px). Varsayılan: 8. */
  edge?: number;
  arrow?: ArrowOptions;
}

/**
 * Faz 16.1 — `document.body`'ye portal edilmiş, `position: fixed` bir panelin
 * konumu. Dropdown'da vardı, Select de aynısına ihtiyaç duyunca buraya
 * taşındı. Konum tek seferlik değil, panel AÇIK KALDIĞI SÜRECE her karede
 * yeniden hesaplanır: sayfa kaydırılınca, sticky bir çubuk hareket edince ya
 * da içerik asenkron yüklenip düzen kayınca ölçüm eskimesin. Değişmeyen
 * karelerde state güncellenmez (gereksiz render yok).
 *
 * Kapalıyken `null` döner; ilk ölçüm gelene kadar da `null` — panel o ana
 * kadar `invisible` çizilmeli (boyutu ölçülebilsin, ama sol-üstte parlamasın).
 */
export function useFloatingPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  { placement, gap, edge = 8, arrow }: FloatingOptions
): FloatingCoords | null {
  const [coords, setCoords] = useState<FloatingCoords | null>(null);
  const arrowInset = arrow?.inset;
  const pointAtCenter = arrow?.pointAtCenter;

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    let frameId: number;
    const update = () => {
      const anchorEl = anchorRef.current;
      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        const panelRect = panelRef.current?.getBoundingClientRect();
        const { top, left, side, arrowOffset } = computePanelPosition(
          { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          { width: panelRect?.width ?? 0, height: panelRect?.height ?? 0 },
          placement,
          { width: window.innerWidth, height: window.innerHeight },
          gap,
          edge,
          arrowInset === undefined ? undefined : { inset: arrowInset, pointAtCenter: !!pointAtCenter }
        );
        const anchorWidth = side === "top" || side === "bottom" ? rect.width : undefined;
        setCoords((prev) =>
          prev && prev.top === top && prev.left === left && prev.side === side && prev.arrowOffset === arrowOffset && prev.anchorWidth === anchorWidth
            ? prev
            : { top, left, side, arrowOffset, anchorWidth }
        );
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [open, placement, gap, edge, arrowInset, pointAtCenter, anchorRef, panelRef]);

  return coords;
}
