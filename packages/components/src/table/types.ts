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

/**
 * Eskiden `tableHeader: string[]` ve `tableBody: ColumnProps<T>[]` İKİ AYRI
 * paralel diziydi — elle senkron tutulması gerekiyordu (bkz. plan denetimi).
 * Artık tek bir `columns` dizisi hem başlığı hem veri eşlemesini taşıyor.
 *
 * `columnName` eskiden `keyof T | string` idi — `| string` kısmı `keyof`
 * kısıtını TAMAMEN etkisiz kılıyordu (herhangi bir string geçilebilirdi).
 * Artık sade `keyof T`; aksiyon-only (aksiyon butonları) kolonlar için
 * opsiyonel.
 */
export interface ColumnDef<T> {
  header: React.ReactNode;
  columnName?: keyof T;
  actions?: ActionProps<T>;
  info?: boolean;
}

export interface TableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  className?: string;
}
