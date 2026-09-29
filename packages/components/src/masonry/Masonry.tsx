"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { SkeletonBlock } from "../skeleton";
import type { MasonryItem, MasonryProps } from "./types";
import { computeLayout, resolveColumns, resolveGap, type MasonryPosition } from "./utils";

export type { MasonryProps, MasonryItem };

const DEFAULT_COLUMNS = { base: 1, sm: 2, lg: 3 };
const PLACEHOLDER_HEIGHTS = ["10rem", "14rem", "8rem", "12rem", "9rem", "13rem"];

// SSR'da useLayoutEffect uyarısı vermesin.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useViewportWidth(): number {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 0 : window.innerWidth));
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

/**
 * Konteyner genişliğini ve her öğenin yüksekliğini izler. Görseller yüklenince
 * ya da metin sarınca öğe büyür → yerleşim yeniden hesaplanır.
 */
function useMeasuredLayout(listRef: React.RefObject<HTMLUListElement | null>, count: number, columns: number, gap: number) {
  const [layout, setLayout] = useState<{ positions: MasonryPosition[]; height: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const items = Array.from(list.children) as HTMLElement[];
      const width = list.clientWidth;
      if (width === 0) return;
      setLayout(computeLayout(items.map((el) => el.offsetHeight), columns, gap, width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const child of Array.from(list.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [listRef, count, columns, gap]);

  return layout;
}

/**
 * Faz 16.3 — yapı ant.design Masonry'den (farklı yükseklikteki öğeler, her
 * biri en kısa sütuna; duyarlı sütun sayısı; `gutter`; `onLayoutChange`),
 * görünüm kendi token'larımızdan (öğelerin kendisi — Card, görsel — tüketicinin).
 *
 * DOM sırası = öğe sırası: yalnız görsel konum hesaplanır (mutlak konum), Tab ve
 * ekran okuyucu sırası verideki gibi kalır. Ölçüm gelmeden (SSR, ilk kare, JS
 * kapalı) CSS `columns` ile makul bir yerleşim çizilir; ölçülünce kesin konum.
 * Semantik: `<ul>` + `<li>`.
 */
export function Masonry({
  items,
  columns = DEFAULT_COLUMNS,
  gutter = "md",
  onLayoutChange,
  className,
  skeleton = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: MasonryProps) {
  const viewport = useViewportWidth();
  const columnCount = resolveColumns(columns, viewport);
  const gap = resolveGap(gutter);
  const listRef = useRef<HTMLUListElement>(null);

  const placeholders = skeleton && items.length === 0;
  const shown: MasonryItem[] = placeholders
    ? PLACEHOLDER_HEIGHTS.map((h, i) => ({ key: `__placeholder-${i}`, children: <SkeletonBlock active height={h} radius="lg" /> }))
    : items;

  const layout = useMeasuredLayout(listRef, shown.length, columnCount, gap);
  const measured = layout !== null && layout.positions.length === shown.length;

  const onLayoutChangeRef = useRef(onLayoutChange);
  onLayoutChangeRef.current = onLayoutChange;
  useEffect(() => {
    if (layout) onLayoutChangeRef.current?.({ columns: columnCount, height: layout.height });
  }, [layout, columnCount]);

  return (
    <ul
      ref={listRef}
      aria-label={skeleton ? undefined : ariaLabel}
      aria-labelledby={skeleton ? undefined : ariaLabelledBy}
      aria-hidden={skeleton || undefined}
      aria-busy={skeleton || undefined}
      className={cn("relative", className)}
      style={measured ? { height: layout.height } : { columnCount, columnGap: gap }}
    >
      {shown.map((item, i) => {
        const pos = measured ? layout.positions[i] : undefined;
        return (
          <li
            key={item.key}
            className={cn(
              pos ? "absolute transition-[top,left] duration-200 ease-out motion-reduce:transition-none" : "break-inside-avoid"
            )}
            style={pos ? { top: pos.top, left: pos.left, width: pos.width } : { marginBottom: gap }}
          >
            {placeholders ? (
              item.children
            ) : (
              <ContentSkeleton on={skeleton} fallback={<SkeletonBlock active height="8rem" radius="lg" />}>
                {item.children}
              </ContentSkeleton>
            )}
          </li>
        );
      })}
    </ul>
  );
}
