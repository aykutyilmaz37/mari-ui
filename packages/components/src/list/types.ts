import type React from "react";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";
import type { PaginationProps } from "../pagination";

export type ListItemLayout = "horizontal" | "vertical";

export type ListGridColumns = 1 | 2 | 3 | 4 | 5 | 6;
export type ListBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

export interface ListGrid {
  /**
   * Sütun sayısı. Tek sayı her genişlikte aynıdır; nesne verilirse kırılım
   * noktası başına (mobil önce): `{ base: 1, sm: 2, lg: 4 }`.
   */
  columns: ListGridColumns | Partial<Record<ListBreakpoint, ListGridColumns>>;
  /** Hücreler arası boşluk. Varsayılan: `md` (16px). */
  gap?: Size;
}

/**
 * `totalItems` VERİLMEZSE sayfalama istemci tarafındadır: List `dataSource`u
 * kendisi dilimler. Verilirse sunucu tarafıdır: `dataSource` zaten o sayfanın
 * kayıtlarıdır, sayfa değişince yenisini siz getirirsiniz (`onPageChange`).
 */
export interface ListPagination extends Partial<Omit<PaginationProps, "skeleton" | "className">> {
  /** Varsayılan: `bottom`. */
  position?: "top" | "bottom" | "both";
}

export interface ListProps<T> extends SkeletonableProps {
  dataSource?: T[];
  /** Her kayıt için bir `<ListItem>` döndürün. */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /**
   * Satır anahtarı: alan adı ya da fonksiyon. Varsayılan: kaydın `key` ya da
   * `id` alanı, yoksa sıra numarası (sıralanan/silinen listelerde verin).
   */
  rowKey?: keyof T | ((item: T, index: number) => React.Key);
  /** `renderItem` yerine elle `<ListItem>`ler. */
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Dış çerçeve + köşe yuvarlaklığı; satırlar yatayda da içeri çekilir. */
  bordered?: boolean;
  /** Satırlar arası ayırıcı çizgi. Varsayılan: `true` (grid'de yok). */
  split?: boolean;
  /** Satır dolgusu: sm 8 / md 12 / lg 16px. Varsayılan: `md`. */
  size?: Size;
  /**
   * `horizontal` (varsayılan): avatar + başlık/açıklama solda, eylemler sağda.
   * `vertical`: içerik akışı (blog, yorum) — eylemler metnin altında, `extra`
   * (ör. görsel) sağda; dar ekranda görsel üste çıkar.
   */
  itemLayout?: ListItemLayout;
  /** Satırlar yerine hücre ızgarası (kart listesi). */
  grid?: ListGrid;
  /** `false` ya da verilmezse sayfalama yok. */
  pagination?: false | ListPagination;
  /** Listenin altında "Daha fazla yükle" alanı (sonsuz liste için düğme). */
  loadMore?: React.ReactNode;
  /**
   * Bir eylem sürüyor (sayfa değişimi, yenileme): mevcut satırlar yerinde
   * soluklaşır ve etkileşime kapanır, üstte spinner. İlk yükleme için `skeleton`.
   */
  loading?: boolean;
  /** Kayıt yokken gösterilen içerik. Varsayılan: küçük bir `Empty` ("Kayıt yok"). */
  empty?: React.ReactNode;
  className?: string;
  /** Listenin erişilebilir adı (başlık görünmüyorsa). */
  "aria-label"?: string;
  /** Listeyi adlandıran görünür başlığın id'si. */
  "aria-labelledby"?: string;
}

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  children?: React.ReactNode;
  /**
   * Satır eylemleri (düğme/link). Aralarına ince ayırıcı çizilir.
   * `horizontal`da sağda, `vertical`da içeriğin altında.
   */
  actions?: React.ReactNode[];
  /** `vertical`da sağdaki (dar ekranda üstteki) alan, ör. kapak görseli. `horizontal`da en sağda. */
  extra?: React.ReactNode;
}

export interface ListItemMetaProps {
  /** Solda avatar/ikon/küçük görsel. */
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}
