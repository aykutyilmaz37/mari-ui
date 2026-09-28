"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Bölge gerçekten taşıyor mu (kaydırılabilir mi)? Kaydırılan bir bölge
 * klavyeyle de kaydırılabilmeli (axe `scrollable-region-focusable`): içinde
 * odaklanabilir öğe yoksa bölgenin kendisi Tab durağı olmalı — ama SADECE
 * taşarken; sığan içeriğe boşuna bir durak eklenmesin.
 *
 * Sabit boyutlu bir kutuda içerik büyüyünce kutunun kendisi yeniden
 * boyutlanmaz → çocuklar da gözlenir. `deps` değişince (ör. içerik/iskelet)
 * yeniden bağlanır.
 */
export function useScrollable(ref: RefObject<HTMLElement | null>, axis: "x" | "y", deps: readonly unknown[] = []): boolean {
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () =>
      setScrollable(axis === "x" ? el.scrollWidth > el.clientWidth + 1 : el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- çağıranın verdiği deps
  }, [ref, axis, ...deps]);
  return scrollable;
}
