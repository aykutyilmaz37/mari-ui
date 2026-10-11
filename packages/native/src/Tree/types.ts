import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/Skeleton";

/** Web `TreeNode` ile aynı şekil. */
export interface TreeNode {
  /** Ağaç genelinde benzersiz anahtar. */
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  /** Başlığın solunda ikon (klasör, dosya…). */
  icon?: React.ReactNode;
  /** Seçilemez, işaretlenemez, açılabilir. */
  disabled?: boolean;
  /** Yalnız onay kutusu kapalı. */
  disableCheckbox?: boolean;
  /** `false`: bu düğüm seçilemez (dokunma yalnız açar/işaretler). */
  selectable?: boolean;
  /** `false`: bu düğümde onay kutusu yok. */
  checkable?: boolean;
  /**
   * Yaprak mı. `loadData` kullanırken çocuğu olmayan düğümler "henüz
   * yüklenmedi" sayılır; gerçek yaprakları `isLeaf: true` ile işaretleyin.
   */
  isLeaf?: boolean;
  /** Arama için düz metin — `title` metin değilse verin. */
  searchText?: string;
}

export interface TreeCheckInfo {
  /** Kesin işaretli anahtarlar (yayılım dahil). */
  checked: string[];
  /** Kısmen işaretli (bazı çocukları işaretli) üst düğümler. */
  halfChecked: string[];
}

export interface TreeProps extends SkeletonableProps {
  treeData: TreeNode[];
  /** Açık düğümler. Verilirse kontrollü. */
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  /** İlk açılışta tüm düğümler açık. */
  defaultExpandAll?: boolean;
  onExpand?: (expandedKeys: string[], info: { node: TreeNode; expanded: boolean }) => void;
  /** Varsayılan: `true`. */
  selectable?: boolean;
  /** Birden çok düğüm seçilebilir (dokunma seçimi aç/kapar). */
  multiple?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (selectedKeys: string[], info: { node: TreeNode; selected: boolean }) => void;
  /** Onay kutuları. */
  checkable?: boolean;
  /** İşaretli düğümler; üst/alt yayılımı ve kısmi durum hesaplanır. */
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  /** Üst ↔ alt bağlantısı yok: her düğüm bağımsız işaretlenir. */
  checkStrictly?: boolean;
  onCheck?: (checkedKeys: string[], info: { node: TreeNode; checked: boolean; halfCheckedKeys: string[] }) => void;
  /** Açılınca çocukları getiren fonksiyon (tembel yükleme); çözülene kadar okta gösterge. `treeData`yı siz güncellersiniz. */
  loadData?: (node: TreeNode) => Promise<void>;
  /** Başlığa dokunma ne yapsın: yalnız seçim (varsayılan) ya da seçim + aç/kapa (dosya gezgini). */
  expandAction?: false | "click";
  /** Girinti kılavuz çizgileri. */
  showLine?: boolean;
  /** Bu metni (Türkçe harf duyarsız) içeren düğümler ve ataları gösterilir, eşleşme vurgulanır, atalar açılır. */
  searchValue?: string;
  /** Başlığı özel çizmek için. */
  titleRender?: (node: TreeNode) => React.ReactNode;
  /** Arama bir şey bulamazsa. Varsayılan: "Sonuç bulunamadı". */
  notFoundContent?: React.ReactNode;
  /** Seçim / işaret rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}
