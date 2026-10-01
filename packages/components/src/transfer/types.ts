import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type TransferDirection = "left" | "right";

export interface TransferItem {
  key: string;
  title: React.ReactNode;
  /** Başlığın altında küçük açıklama. */
  description?: React.ReactNode;
  disabled?: boolean;
  /** `title` düz metin değilse aramada kullanılacak metin. */
  searchText?: string;
}

export interface TransferListFooterProps {
  direction: TransferDirection;
}

export interface TransferProps extends SkeletonableProps {
  /** Tüm öğeler. Sol liste = hedefte olmayanlar (bu sırayla). */
  dataSource: TransferItem[];
  /** Sağdaki (hedef) öğelerin anahtarları — sağ liste bu sırayla çizilir. */
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  /** Taşıma sonrası: yeni hedef anahtarları, yön ve taşınan anahtarlar. Yeni taşınanlar hedefin sonuna eklenir. */
  onChange?: (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void;
  /** İki listedeki seçili (işaretli) anahtarlar birlikte. */
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  /** Liste başlıkları. Varsayılan: `["Kaynak", "Hedef"]`. */
  titles?: [React.ReactNode, React.ReactNode];
  /**
   * Taşıma düğmelerinin görünen metni (`[sağa, sola]`). Verilmezse yalnız ok
   * ikonu; erişilebilir ad her durumda "… taşı" cümlesidir.
   */
  operations?: [string, string];
  /** Her listede arama kutusu. Varsayılan: `false`. */
  showSearch?: boolean;
  /** Varsayılan: "Ara". */
  searchPlaceholder?: string;
  /** Özel eşleşme. Varsayılan: Türkçe/aksansız `title`/`searchText` içinde arama. */
  filterOption?: (input: string, item: TransferItem, direction: TransferDirection) => boolean;
  onSearch?: (direction: TransferDirection, value: string) => void;
  /** Satır içeriği. Varsayılan: `title` (+ `description`). */
  render?: (item: TransferItem) => React.ReactNode;
  /**
   * Tek yön: hedefte işaret kutusu yok, her satırda "kaldır" düğmesi; sola
   * taşıma düğmesi yok. "Seçilenler" sepeti gibi.
   */
  oneWay?: boolean;
  /** Başlıktaki "tümünü seç" kutusu. Varsayılan: `true`. */
  showSelectAll?: boolean;
  /** Liste altı (ör. "Yenile" düğmesi). */
  footer?: (props: TransferListFooterProps) => React.ReactNode;
  /** Boş liste metni. Varsayılan: "Öğe yok" (aramada "Sonuç bulunamadı"). */
  notFoundContent?: React.ReactNode;
  /** Liste gövdesinin yüksekliği. Varsayılan: `"14rem"`. */
  listHeight?: string;
  disabled?: boolean;
  /** Doğrulama durumu (`error`/`warning`) — liste kenarlıkları. */
  color?: ColorRole;
  /** Bileşenin (grubun) erişilebilir adı. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}
