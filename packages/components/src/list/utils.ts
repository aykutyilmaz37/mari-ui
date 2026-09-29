import type React from "react";
import type { Size } from "@mari-ui/core";
import type { ListBreakpoint, ListGrid, ListGridColumns, ListProps } from "./types";

/** `rowKey` → alan/fonksiyon; yoksa `key`/`id` alanı, o da yoksa sıra numarası. */
export function resolveRowKey<T>(item: T, index: number, rowKey: ListProps<T>["rowKey"]): React.Key {
  if (typeof rowKey === "function") return rowKey(item, index);
  if (rowKey !== undefined) return String(item[rowKey]);
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    for (const field of ["key", "id"]) {
      const value = record[field];
      if (typeof value === "string" || typeof value === "number") return value;
    }
  }
  return index;
}

/** İstemci tarafı sayfalama: 1 tabanlı `page`, kayıt aralığı dışına taşarsa son sayfa. */
export function getPageSlice<T>(data: T[], page: number, pageSize: number): { items: T[]; page: number; offset: number } {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * pageSize;
  return { items: data.slice(offset, offset + pageSize), page: safePage, offset };
}

// Tailwind derleme zamanında tarar — her sınıf literal.
const COLUMNS: Record<ListBreakpoint, Record<ListGridColumns, string>> = {
  base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" },
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" },
  xl: { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" },
};

const GAP: Record<Size, string> = { sm: "gap-2", md: "gap-4", lg: "gap-6" };

const BREAKPOINTS: ListBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

/**
 * Izgara sınıfları. Tek sayı verilse de mobilde tek sütuna düşmez — tüketici
 * mobil düzeni istiyorsa nesne biçimini kullanır (ant `grid.xs` gibi).
 */
export function gridClassName(grid: ListGrid): string {
  const columns = typeof grid.columns === "number" ? { base: grid.columns } : grid.columns;
  const classes = BREAKPOINTS.flatMap((bp) => {
    const count = columns[bp];
    return count ? [COLUMNS[bp][count]] : [];
  });
  if (columns.base === undefined) classes.unshift(COLUMNS.base[1]);
  return ["grid", GAP[grid.gap ?? "md"], ...classes].join(" ");
}
