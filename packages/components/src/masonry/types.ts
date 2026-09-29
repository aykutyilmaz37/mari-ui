import type React from "react";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type MasonryBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type MasonryColumns = number | Partial<Record<MasonryBreakpoint, number>>;

export interface MasonryItem {
  key: React.Key;
  children: React.ReactNode;
}

export interface MasonryProps extends SkeletonableProps {
  items: MasonryItem[];
  /**
   * Sütun sayısı; nesne ile pencere genişliğine göre (mobil önce).
   * Varsayılan: `{ base: 1, sm: 2, lg: 3 }`.
   */
  columns?: MasonryColumns;
  /** Öğeler arası boşluk: sm 8 / md 16 / lg 24px ya da px. Varsayılan: `md`. */
  gutter?: Size | number;
  /** Yerleşim her değiştiğinde (öğe yüksekliği, sütun sayısı). */
  onLayoutChange?: (info: { columns: number; height: number }) => void;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
