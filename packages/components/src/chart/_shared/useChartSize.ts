"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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
 */
export function useChartSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0, rem: 16 });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
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
  }, []);

  return [ref, size] as const;
}
