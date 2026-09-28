"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@mari-ui/core";
import type { DropdownContentProps } from "../types";
import { useDropdown } from "../useDropdown";
import { elevationClass } from "../../lib/elevationClass";
import { FLOATING_ARROW_GAP_PX, FLOATING_ARROW_INSET_PX, FLOATING_EDGE_PX, FLOATING_GAP_PX, FloatingArrow } from "../../lib/FloatingArrow";
import { useFloatingPosition } from "../../lib/useFloatingPosition";
import { getFocusable } from "../utils";


/**
 * Panel `document.body`'e portal edilip `position: fixed` ile konumlanır
 * (`overflow: hidden` atalar tarafından kırpılmasın diye). Konum tek seferlik
 * değil, panel AÇIK KALDIĞI SÜRECE her karede yeniden hesaplanır: içerik
 * asenkron yüklenip sayfa düzenini geç kaydırdığında ölçüm eskimesin. Hesabın
 * kendisi (yön, hiza, flip, kelepçeleme, ok) `computePanelPosition`da —
 * floating-ui gibi bir kütüphaneye geçilmedi (bkz. plan: "floating-ui kapsam dışı").
 *
 * Yükseklik, foundations/Elevation'daki kurala göre `elevationClass.md`
 * (Dropdown/popover için `shadow-mari-md` + ince `border-mari-border`);
 * dikey yönlerde en az tetikleyici genişliğinde.
 */
export function DropdownContent({ placement = "bottom-end", children, className, customVisible, arrow, offset = 0 }: DropdownContentProps) {
  const { visible, anchorRef, panelRef, panelId, focusPanelOnOpenRef, hoverMode, scheduleHoverClose, cancelHoverClose } = useDropdown();
  const isVisible = customVisible ?? visible;
  const hasArrow = !!arrow;
  const pointAtCenter = typeof arrow === "object" && !!arrow.pointAtCenter;
  const coords = useFloatingPosition(isVisible, anchorRef, panelRef, {
    placement,
    gap: (hasArrow ? FLOATING_ARROW_GAP_PX : FLOATING_GAP_PX) + offset,
    edge: FLOATING_EDGE_PX,
    arrow: hasArrow ? { inset: FLOATING_ARROW_INSET_PX, pointAtCenter } : undefined,
  });

  // Panel `body`'nin sonuna portal edildiğinden Tab ile tetikleyiciden panele
  // DOM sırasıyla ulaşılamaz. Klavyeyle (Enter/Boşluk) açıldıysa odağı
  // panele biz taşırız — ama `invisible` (visibility: hidden) bir öğeye odak
  // verilemediğinden konum hesaplanana (`coords`) kadar beklenir.
  useEffect(() => {
    const edge = focusPanelOnOpenRef.current;
    if (!isVisible || !coords || !edge) return;
    focusPanelOnOpenRef.current = false;
    const panel = panelRef.current;
    const focusable = getFocusable(panel);
    const target = edge === "last" ? focusable.at(-1) : focusable[0];
    (target ?? panel)?.focus();
  }, [isVisible, coords, focusPanelOnOpenRef, panelRef]);

  if (!isVisible || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      id={panelId}
      tabIndex={-1}
      // `hover` modundayken panel de tetikleyiciyle AYNI gecikmeli kapatma
      // mekanizmasını paylaşıyor — mouse tetikleyiciden panele geçerken
      // (bkz. useDropdown.tsx'teki açıklama) `cancelHoverClose` bekleyen
      // kapatmayı iptal ediyor, panelden ayrılınca `scheduleHoverClose`
      // yeniden planlıyor.
      onMouseEnter={hoverMode ? cancelHoverClose : undefined}
      onMouseLeave={hoverMode ? scheduleHoverClose : undefined}
      className={cn(
        // Genişlik viewport'tan 1rem dar kalır: 375px'te geniş bir panel ekrandan taşmaz.
        "fixed text-wrap z-mari-dropdown w-max max-w-[min(42rem,calc(100vw-1rem))] text-sm p-1 rounded-lg bg-mari-surface outline-none",
        elevationClass.md,
        !coords && "invisible",
        className
      )}
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0, minWidth: coords?.anchorWidth }}
    >
      {hasArrow && coords && <FloatingArrow side={coords.side} offset={coords.arrowOffset} />}
      {children}
    </div>,
    document.body
  );
}
