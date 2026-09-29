import type { Size } from "@mari-ui/core";
import type { MasonryBreakpoint, MasonryColumns } from "./types";

export interface MasonryPosition {
  left: number;
  top: number;
  width: number;
  column: number;
}

/**
 * Her öğeyi o an EN KISA sütuna koyar (eşitlikte soldaki). DOM sırası = öğe
 * sırası kalır — yalnız görsel konum hesaplanır, klavye/okuma sırası bozulmaz.
 */
export function computeLayout(heights: number[], columns: number, gap: number, containerWidth: number): { positions: MasonryPosition[]; height: number } {
  const cols = Math.max(1, Math.floor(columns));
  const width = Math.max(0, (containerWidth - gap * (cols - 1)) / cols);
  const columnHeights = Array.from({ length: cols }, () => 0);
  const positions = heights.map((h) => {
    let column = 0;
    for (let c = 1; c < cols; c++) if (columnHeights[c]! < columnHeights[column]!) column = c;
    const top = columnHeights[column]!;
    columnHeights[column] = top + h + gap;
    return { left: column * (width + gap), top, width, column };
  });
  const height = Math.max(0, ...columnHeights.map((h) => (h > 0 ? h - gap : 0)));
  return { positions, height };
}

/** Tailwind kırılımları (px), mobil önce. */
export const BREAKPOINTS: Record<Exclude<MasonryBreakpoint, "base">, number> = { sm: 640, md: 768, lg: 1024, xl: 1280 };

/** Pencere genişliğine göre geçerli sütun sayısı. */
export function resolveColumns(columns: MasonryColumns, viewportWidth: number): number {
  if (typeof columns === "number") return columns;
  let value = columns.base ?? 1;
  for (const bp of ["sm", "md", "lg", "xl"] as const) {
    const count = columns[bp];
    if (count !== undefined && viewportWidth >= BREAKPOINTS[bp]) value = count;
  }
  return value;
}

export const GAP_PX: Record<Size, number> = { sm: 8, md: 16, lg: 24 };

export function resolveGap(gutter: Size | number): number {
  return typeof gutter === "number" ? gutter : GAP_PX[gutter];
}
