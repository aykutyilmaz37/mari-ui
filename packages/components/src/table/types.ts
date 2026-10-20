import type React from "react";
import type { SkeletonableProps } from "../lib/skeleton";

export interface ActionProps<T> {
  /**
   * "Düzenle" düğmesi bu satırla çağrılır — düzenleme yüzeyini (Drawer, Modal,
   * ayrı sayfa) tüketici açar. Tablo kendi çekmecesini taşımaz (Faz 4c: Drawer
   * yalnız onu kullanana gelsin).
   */
  editRow?: (item: T) => void;
  editRowInInline?: {
    onChange: (item: T) => void;
  };
  deleteRow?: (id: string) => void;
  navigateRow?: (id: string) => void;
}

export type TableColumnAlign = "start" | "center" | "end";

/*
 * Eskiden `tableHeader: string[]` ve `tableBody: ColumnProps<T>[]` İKİ AYRI
 * paralel diziydi — elle senkron tutulması gerekiyordu.
 * Artık tek bir `columns` dizisi hem başlığı hem veri eşlemesini taşıyor.
 *
 * `columnName` eskiden `keyof T | string` idi — `| string` kısmı `keyof`
 * kısıtını TAMAMEN etkisiz kılıyordu (herhangi bir string geçilebilirdi).
 * Artık sade `keyof T`; aksiyon-only (aksiyon butonları) kolonlar için
 * opsiyonel.
 *
 * `align` eskiden yoktu — hizalama DOM index'ine göre otomatik seçiliyordu
 * (ilk sütun sol, son sütun sağ, ortadakiler merkez). Bu, aynı tablodaki
 * her sütunun farklı hizalanmasına yol açıyordu. Artık tüm sütunlar
 * varsayılan olarak SOLA hizalı; farklı bir hizalama gerekiyorsa (örn. sayısal
 * bir sütun) `align` ile açıkça belirtilir.
 */
/** Tablo sütunu: başlık, gösterilecek alan (`columnName`), isteğe bağlı `render`, hiza ve davranış ayarları. */
export interface ColumnDef<T> {
  header: React.ReactNode;
  columnName?: keyof T;
  actions?: ActionProps<T>;
  info?: boolean;
  /** Hücre/başlık metninin hizalanması. Varsayılan: `"start"` (sola hizalı). */
  align?: TableColumnAlign;
  /**
   * Hücrenin özel içeriği: durum için `Tag`, kişi için
   * `Avatar` + isim, biçimlendirilmiş tutar, link… Verilmezse değer düz metin
   * olarak (2 satırda kırpılıp taşarsa tooltip'le) gösterilir. Satır içi
   * düzenleme sırasında `columnName`'li sütunlar yine `Input` olur.
   */
  render?: (value: T[keyof T] | undefined, row: T, rowIndex: number) => React.ReactNode;
}

export interface TableEmptyStateConfig {
  /** Varsayılan: "Veri Bulunamadı". */
  title?: string;
  description?: string;
}

export interface TableProps<T extends { id: string }> extends SkeletonableProps {
  data: T[];
  /**
   * Tablonun erişilebilir adı (ör. "Kullanıcılar") — ekran okuyucuya
   * `<caption>` olarak okunur, yatay kaydırma bölgesinin adı da olur.
   */
  label?: string;
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
  /**
   * Tablonun altında, çerçevenin içinde (üstte ince ayırıcıyla) gösterilir —
   * tipik olarak `Pagination` (`@mari-ui/components/pagination`). Tablo veriyi
   * dilimlemez: `data` o sayfanın satırlarıdır (istemci taraflıda
   * `rows.slice((page - 1) * pageSize, page * pageSize)`). Sayfalama bileşeni
   * yalnız onu kullanana gelir (Faz 4c).
   */
  footer?: React.ReactNode;
  /** `skeleton` + veri yokken çizilecek sahte satır sayısı (en çok 10). Varsayılan: 5 — sayfalıda sayfa boyunu verin. */
  skeletonRows?: number;
}
