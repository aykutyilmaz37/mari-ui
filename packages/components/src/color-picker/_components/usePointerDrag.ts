"use client";

import type React from "react";
import { useRef } from "react";
import { ratioFromPointer } from "../utils";

type Ratio = { x: number; y: number };

/**
 * Alan/kaydırıcı sürükleme: basınca konuma atlar, işaretçi yakalanır (öğenin
 * dışına taşsa da izlenir), bırakınca `onEnd`. Dokunmatikte sayfa kaymasın
 * diye öğeye `touch-none` verilmeli.
 */
export function usePointerDrag(onMove: (ratio: Ratio) => void, onEnd: () => void) {
  const dragging = useRef(false);
  const update = (e: React.PointerEvent<HTMLElement>) => onMove(ratioFromPointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()));
  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.currentTarget.focus();
      e.preventDefault();
      update(e);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (dragging.current) update(e);
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      onEnd();
    },
    onLostPointerCapture: () => {
      if (!dragging.current) return;
      dragging.current = false;
      onEnd();
    },
  };
}
