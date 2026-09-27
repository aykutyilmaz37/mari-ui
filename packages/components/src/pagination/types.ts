import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";

export type PageItem = number | { type: "ellipsis"; direction: "left" | "right" };

/** Aktif sayfa düğmesinin görünümü. `outline` ant.design'daki varsayılan yapıya karşılık gelir. */
export type PaginationVariant = "outline" | "soft" | "solid";

export type PaginationAlign = "start" | "center" | "end" | "between";

export interface PaginationProps {
  /** Aktif sayfa (1 tabanlı). Verilirse controlled çalışır; verilmezse `defaultPage` ile dahili state tutulur. */
  currentPage?: number;
  /** Uncontrolled modda ilk sayfa. Varsayılan: `1`. */
  defaultPage?: number;
  /** Sayfa başına öğe sayısı. Verilirse controlled çalışır. */
  pageSize?: number;
  /** Uncontrolled modda ilk sayfa boyutu. Varsayılan: `10`. */
  defaultPageSize?: number;
  totalItems: number;
  /** Sayfa gerçekten DEĞİŞTİĞİNDE çağrılır (aktif sayfaya tekrar tıklamak çağırmaz). */
  onPageChange?: (page: number, pageSize: number) => void;
  /**
   * Sayfa boyutu değiştiğinde çağrılır. İkinci argüman, kullanıcının baktığı
   * ilk kaydı görünür tutan yeni sayfadır — sayfa değiştiyse `onPageChange`
   * de (bundan ÖNCE) aynı değerle çağrılır.
   */
  onPageSizeChange?: (pageSize: number, page: number) => void;
  /** Sayfa boyutu seçicisini gösterir. Varsayılan: `onPageSizeChange` verildiyse `true`. */
  showSizeChanger?: boolean;
  /** Varsayılan: `[10, 20, 50, 100, 1000]`. */
  pageSizeOptions?: number[];
  /**
   * `true`: "1-10 / 95 kayıt" bilgisini gösterir. Fonksiyon verilirse metni
   * kendiniz üretirsiniz: `(total, [start, end]) => ReactNode`.
   * Varsayılan: `false`.
   */
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  /** "Git [__]" alanı — doğrudan bir sayfa numarası yazıp Enter ile atlama. */
  showQuickJumper?: boolean;
  /** Sadece `‹ [3] / 10 ›` — dar alanlar (mobil, kart altı) için. */
  simple?: boolean;
  /** Aktif sayfanın iki yanında kaç komşu sayfa gösterileceği. Varsayılan: `1`. */
  siblingCount?: number;
  /** Varsayılan: `"md"`. */
  size?: Size;
  /** Aktif sayfa rengi. Varsayılan: `"primary"`. */
  color?: ColorRole;
  /** Aktif sayfa görünümü. Varsayılan: `"outline"`. */
  variant?: PaginationVariant;
  disabled?: boolean;
  /** Tek sayfa varsa hiçbir şey render etmez. */
  hideOnSinglePage?: boolean;
  /** Varsayılan: `"between"` — kayıt bilgisi solda, kontroller sağda. */
  align?: PaginationAlign;
  className?: string;
  /** `<nav>` için erişilebilir isim. Varsayılan: `"Sayfalama"`. */
  "aria-label"?: string;
}
