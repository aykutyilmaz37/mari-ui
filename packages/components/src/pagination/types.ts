export type PageItem = number | { type: "ellipsis"; direction: "left" | "right" };

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** "1-10 / 95 kayıt" bilgisini sol tarafta gösterir. Varsayılan: `false` (eski davranış — sadece sayfa düğmeleri). */
  showTotal?: boolean;
  /** Verilirse sağ tarafta "Sayfa başına" seçici render edilir. */
  onPageSizeChange?: (pageSize: number) => void;
  /** `onPageSizeChange` ile birlikte kullanılır. Varsayılan: `[10, 20, 50, 100, 1000]`. */
  pageSizeOptions?: number[];
}
