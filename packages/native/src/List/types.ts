import type { ReactElement, ReactNode } from "react";
import type { FlatListProps, ViewProps } from "react-native";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/Skeleton";

export type ListItemLayout = "horizontal" | "vertical";

/** Infinite scrolling behavior backed by React Native `FlatList.onEndReached`. */
export interface InfiniteScrollOptions {
  /** Whether more records are available. */
  hasMore: boolean;
  /** Set while the next page is being fetched; prevents duplicate requests. */
  loading?: boolean;
  /** Fetch the next page. Append records to `data` in the caller. */
  onLoadMore: () => void;
  /** Message displayed after all records have loaded. `null` hides it. */
  endMessage?: ReactNode;
  /** Accessible action label displayed in the native list footer. */
  loadMoreLabel?: string;
}

/** `FlatList` API'sini korur; `renderItem(item, index)` kolaylığını ekler. */
export interface ListProps<ItemT> extends Omit<FlatListProps<ItemT>, "data" | "renderItem" | "ItemSeparatorComponent">, SkeletonableProps {
  /** Veri kaynağı; boş bırakıldığında `ListEmptyComponent` gösterilir. */
  data?: Exclude<FlatListProps<ItemT>["data"], undefined>;
  /** Her kaydı bir native öğeye dönüştürür. */
  renderItem: (item: ItemT, index: number) => ReactElement | null;
  /** Satırlar arası ayırıcı. Verilmezse `split` varsayılan ayırıcıyı yönetir. */
  ItemSeparatorComponent?: Exclude<FlatListProps<ItemT>["ItemSeparatorComponent"], undefined>;
  /** `ItemSeparatorComponent` verilmediğinde ayırıcıyı açıp kapatır. Varsayılan: `true`. */
  split?: boolean;
  /** Satır yoğunluğu; native ölçü ölçeğinden gelir. Varsayılan: `md`. */
  size?: Size;
  /** Liste çevresine native tema kenarlığı ve köşe verir. */
  bordered?: boolean;
  /** `ListItem` içeriğinin yatay veya dikey düzeni. Varsayılan: `horizontal`. */
  itemLayout?: ListItemLayout;
  /** İlk yükleme yer tutucu satırlarının sayısı. Varsayılan: `3`. */
  skeletonRows?: number;
  /**
   * Sonsuz kaydırma: `FlatList.onEndReached` tetiklenince sonraki sayfayı ister.
   * Yeni kayıtları `data`ya siz eklersiniz; `hasMore`/`loading`ı güncel tutun.
   * Eşik `onEndReachedThreshold` ile ayarlanır (varsayılan: `0.5`).
   */
  infinite?: InfiniteScrollOptions;
}

export interface ListItemProps extends ViewProps {
  children?: ReactNode;
  /** Satır eylemleri. */
  actions?: ReactNode[];
  /** Sağda duran ek içerik; ör. durum rozeti veya tarih. */
  extra?: ReactNode;
}

export interface ListItemMetaProps {
  /** Solda avatar, ikon veya küçük görsel. */
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  style?: Exclude<ViewProps["style"], undefined>;
}
