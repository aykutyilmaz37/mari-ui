import type React from "react";

export interface ActionProps<T> {
  onEditWithDrawer?: {
    form: React.ComponentType<{ refetch: () => void; initialData: T; closeModal: () => void }>;
    title: string;
    description: string;
  };
  editRowInInline?: {
    onChange: (item: T) => void;
  };
  deleteRow?: (id: string) => void;
  navigateRow?: (id: string) => void;
  refetch?: () => void;
}

export type TableColumnAlign = "start" | "center" | "end";

/**
 * Eskiden `tableHeader: string[]` ve `tableBody: ColumnProps<T>[]` İKİ AYRI
 * paralel diziydi — elle senkron tutulması gerekiyordu (bkz. plan denetimi).
 * Artık tek bir `columns` dizisi hem başlığı hem veri eşlemesini taşıyor.
 *
 * `columnName` eskiden `keyof T | string` idi — `| string` kısmı `keyof`
 * kısıtını TAMAMEN etkisiz kılıyordu (herhangi bir string geçilebilirdi).
 * Artık sade `keyof T`; aksiyon-only (aksiyon butonları) kolonlar için
 * opsiyonel.
 *
 * `align` eskiden yoktu — hizalama DOM index'ine göre otomatik seçiliyordu
 * (ilk sütun sol, son sütun sağ, ortadakiler merkez). Bu, aynı tablodaki
 * her sütunun farklı hizalanmasına yol açıyordu (kullanıcı bulgusu — "sütunları
 * sol ortalı sağa göre hizalamışız her sütun farklı"). Artık tüm sütunlar
 * varsayılan olarak SOLA hizalı; farklı bir hizalama gerekiyorsa (örn. sayısal
 * bir sütun) `align` ile açıkça belirtilir.
 */
export interface ColumnDef<T> {
  header: React.ReactNode;
  columnName?: keyof T;
  actions?: ActionProps<T>;
  info?: boolean;
  /** Hücre/başlık metninin hizalanması. Varsayılan: `"start"` (sola hizalı). */
  align?: TableColumnAlign;
}

export interface TableEmptyStateConfig {
  /** Varsayılan: "Veri Bulunamadı". */
  title?: string;
  description?: string;
}

export interface TablePaginationConfig {
  /** 1 tabanlı geçerli sayfa. */
  page: number;
  pageSize: number;
  /** Tüm sayfalardaki toplam satır sayısı. */
  total: number;
  /** Varsayılan: `[10, 20, 50, 100, 1000]`. */
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface TableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
  /** Veri boş dizi olduğunda gösterilecek `Empty` içeriği. */
  emptyState?: TableEmptyStateConfig;
  /**
   * `"scroll"` (varsayılan): dar ekranda tablo yatay kaydırılır, işlemler
   * sütunu sağda sabit kalır. `"accordion"`: küçük ekranlarda (`md` altı)
   * satırlar tablo yerine açılır/kapanır kartlar olarak gösterilir — geniş
   * ekranda hâlâ normal tablo render edilir.
   */
  responsive?: "scroll" | "accordion";
  /** Verildiğinde tablonun altında sayfalama kontrolleri render edilir. */
  pagination?: TablePaginationConfig;
  /**
   * `"server"` (varsayılan): `data` zaten o sayfaya ait dilim olarak
   * verilir, `Table` hiçbir dilimleme yapmaz — `onPageChange`'de tüketici
   * yeni veriyi kendi getirir (API çağrısı vb.). `"client"`: `Table`,
   * `data`'nın TAMAMINI alır ve `pagination.page`/`pageSize`'a göre kendi
   * dilimler — tüketici sadece sayfa state'ini günceller, sunucu isteği
   * gerekmez.
   */
  paginationMode?: "client" | "server";
}
