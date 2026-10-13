/** Masonry'nin saf mantığı — web `masonry/utils` ile aynı (kırılımlar native kapsayıcı genişliğine göre). */
import type { Size } from "@mari-ui/core";


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

/** Kırılımlar (pt) — native'de kapsayıcı genişliği: telefon dikey < 480 ≤ telefon yatay / küçük tablet < 768 ≤ tablet. */
export type MasonryBreakpoint = "base" | "sm" | "md" | "lg";
export type MasonryColumns = number | Partial<Record<MasonryBreakpoint, number>>;
export const BREAKPOINTS: Record<Exclude<MasonryBreakpoint, "base">, number> = { sm: 480, md: 768, lg: 1024 };

/** Kapsayıcı genişliğine göre geçerli sütun sayısı (mobil önce). */
export function resolveColumns(columns: MasonryColumns, width: number): number {
  if (typeof columns === "number") return columns;
  let value = columns.base ?? 2;
  for (const bp of ["sm", "md", "lg"] as const) {
    const count = columns[bp];
    if (count !== undefined && width >= BREAKPOINTS[bp]) value = count;
  }
  return value;
}

export const GAP_PX: Record<Size, number> = { sm: 8, md: 16, lg: 24 };

export function resolveGap(gutter: Size | number): number {
  return typeof gutter === "number" ? gutter : GAP_PX[gutter];
}
