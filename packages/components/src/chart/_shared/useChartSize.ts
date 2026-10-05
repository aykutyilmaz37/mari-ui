"use client";

import { useCallback, useEffect, useState } from "react";

export interface ChartSize {
  width: number;
  height: number;
  /** Kök yazı boyutu (px) — eksen boşlukları ve etiket genişliği tahmini rem'e göre ölçeklensin. */
  rem: number;
}

/**
 * Kapsayıcının gerçek boyutu. Grafik SVG'si koordinatlarını buna göre kurar
 * (viewBox germe yok → yazılar ve çizgi kalınlıkları bozulmaz). Sunucuda ve
 * ilk ölçümden önce 0 — grafik o an yalnız kutuyu çizer.
 *
 * Geri çağrılı ref: ölçülen öğe SONRADAN da DOM'a girebilir (iskelet → yüklü
 * geçişinde çizim alanı ilk render'da yoktur). Nesne ref + tek seferlik efekt
 * o durumda hiç ölçmüyordu → grafik boş kalıyordu.
 */
export function useChartSize<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0, rem: 16 });
  const ref = useCallback((node: T | null) => setEl(node), []);

  useEffect(() => {
    if (!el) return;
    const measure = () => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setSize((prev) =>
        prev.width === el.clientWidth && prev.height === el.clientHeight && prev.rem === rem
          ? prev
          : { width: el.clientWidth, height: el.clientHeight, rem }
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return [ref, size] as const;
}
