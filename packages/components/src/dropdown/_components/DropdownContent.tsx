"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@mari-ui/core";
import type { DropdownContentProps } from "../types";
import { useDropdown } from "../useDropdown";
import { elevationClass } from "../../lib/elevationClass";
import { computePanelPosition, getFocusable } from "../utils";

/**
 * Yapısal ölçüler (boşluk, ok konumu) ant.design'ın canlı Dropdown sayfasından
 * `getComputedStyle` ile alındı: ok yokken tetikleyiciyle panel arasında 4px,
 * okluyken 12px (8px'lik ok kutusu + 4px) boşluk; ok, panelin hizalandığı
 * kenardan 12px içeride başlayan 16px'lik bir kutu, yani ORTASI kenardan 20px.
 * GÖRÜNÜM (gölge, kenarlık, renk) ant'tan değil kendi token'larımızdan gelir.
 */
const GAP_PX = 4;
const ARROW_GAP_PX = 12;
const ARROW_INSET_PX = 20;
/** Panel viewport kenarına YAPIŞMASIN diye bırakılan minimum boşluk. */
const EDGE_PADDING_PX = 8;

type Side = "top" | "bottom" | "left" | "right";

/** ant.design okunun birebir `clip-path`i: 16×8, ucu yuvarlak, taban köşeleri panele yumuşakça karışan üçgen. */
const ARROW_FILL_PATH = "M 0 8 A 4 4 0 0 0 2.82843 6.82843 L 6.58579 3.07107 A 2 2 0 0 1 9.41421 3.07107 L 13.1716 6.82843 A 4 4 0 0 0 16 8 Z";
/** Aynı yol KAPATILMADAN — kenarlık rengiyle sadece eğik kenarlar çizilir; taban çizgisi panelin kenarlığının üstünden geçmesin diye (dolgu o kısmı örter). */
const ARROW_STROKE_PATH = "M 0 8 A 4 4 0 0 0 2.82843 6.82843 L 6.58579 3.07107 A 2 2 0 0 1 9.41421 3.07107 L 13.1716 6.82843 A 4 4 0 0 0 16 8";

const ARROW_LONG_PX = 16;
const ARROW_SHORT_PX = 8;
/** Panelin kenarlığı: mutlak konumlu ok padding kutusuna göre konumlanır, bu yüzden çapraz eksende 1px düzeltilir. */
const BORDER_PX = 1;

/** `side` panelin tetikleyiciye GÖRE konumu; ok panelin tetikleyiciye bakan kenarında durur ve tetikleyiciyi gösterir. */
function getArrowBox(side: Side, offset: number): { style: React.CSSProperties; rotation: number } {
  const half = ARROW_LONG_PX / 2 + BORDER_PX;
  switch (side) {
    case "bottom":
      return { style: { left: offset - half, top: -ARROW_SHORT_PX, width: ARROW_LONG_PX, height: ARROW_SHORT_PX }, rotation: 0 };
    case "top":
      return { style: { left: offset - half, top: "100%", width: ARROW_LONG_PX, height: ARROW_SHORT_PX }, rotation: 180 };
    case "right":
      return { style: { left: -ARROW_SHORT_PX, top: offset - half, width: ARROW_SHORT_PX, height: ARROW_LONG_PX }, rotation: -90 };
    default:
      return { style: { left: "100%", top: offset - half, width: ARROW_SHORT_PX, height: ARROW_LONG_PX }, rotation: 90 };
  }
}

function DropdownArrow({ side, offset }: { side: Side; offset: number }) {
  const { style, rotation } = getArrowBox(side, offset);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute" style={style}>
      <svg
        width={ARROW_LONG_PX}
        height={ARROW_SHORT_PX}
        viewBox="0 0 16 8"
        className="absolute left-1/2 top-1/2 overflow-visible"
        style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      >
        <path d={ARROW_FILL_PATH} className="fill-mari-surface" />
        {/* Taban ucu panelin 1px kenarlığının TAM ortasına otursun diye yarım piksel yukarı: aksi halde çizgi kenarlığın 0.5px dışına/altına taşıp çıkıntı bırakır. */}
        <path d={ARROW_STROKE_PATH} fill="none" transform="translate(0 -0.5)" className="stroke-mari-border" />
      </svg>
    </span>
  );
}

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
  const [coords, setCoords] = useState<{ top: number; left: number; side: Side; arrowOffset: number; minWidth: number | undefined } | null>(null);
  const isVisible = customVisible ?? visible;
  const hasArrow = !!arrow;
  const pointAtCenter = typeof arrow === "object" && !!arrow.pointAtCenter;

  useEffect(() => {
    if (!isVisible) {
      setCoords(null);
      return;
    }

    let frameId: number;

    const updatePosition = () => {
      const anchorEl = anchorRef.current;
      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        const panelRect = panelRef.current?.getBoundingClientRect();
        const { top, left, side, arrowOffset } = computePanelPosition(
          { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          { width: panelRect?.width ?? 0, height: panelRect?.height ?? 0 },
          placement,
          { width: window.innerWidth, height: window.innerHeight },
          (hasArrow ? ARROW_GAP_PX : GAP_PX) + offset,
          EDGE_PADDING_PX,
          hasArrow ? { inset: ARROW_INSET_PX, pointAtCenter } : undefined
        );
        const minWidth = side === "top" || side === "bottom" ? rect.width : undefined;
        setCoords((prev) =>
          prev && prev.top === top && prev.left === left && prev.side === side && prev.arrowOffset === arrowOffset && prev.minWidth === minWidth
            ? prev
            : { top, left, side, arrowOffset, minWidth }
        );
      }
      frameId = requestAnimationFrame(updatePosition);
    };

    frameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, placement, hasArrow, pointAtCenter, offset, anchorRef, panelRef]);

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
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0, minWidth: coords?.minWidth }}
    >
      {hasArrow && coords && <DropdownArrow side={coords.side} offset={coords.arrowOffset} />}
      {children}
    </div>,
    document.body
  );
}
