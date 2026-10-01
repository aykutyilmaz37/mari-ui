import type React from "react";
import type { ColorRole, Placement, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";
import type { InputShape, InputVariant } from "../input/types";
import type { TreeNode } from "../tree/types";

/**
 * İşaretli modda değere hangi düğümler yazılsın:
 * - `child` (varsayılan): yalnız işaretli yapraklar.
 * - `parent`: tamamı işaretli bir dal tek anahtar (üst düğüm) olarak.
 * - `all`: işaretli her düğüm.
 */
export type TreeSelectCheckedStrategy = "child" | "parent" | "all";

interface TreeSelectBaseProps extends SkeletonableProps {
  treeData: TreeNode[];
  placeholder?: string;
  /** Ağacı yazarak süz (Türkçe harf duyarsız); eşleşenlerin ataları açılır. Varsayılan: `false`. */
  showSearch?: boolean;
  onSearch?: (text: string) => void;
  /** Varsayılan: `false`. */
  allowClear?: boolean;
  /** Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  /** Varsayılan: `"Sonuç bulunamadı"`. */
  notFoundContent?: React.ReactNode;
  /** İlk açılışta tüm dallar açık. Varsayılan: `false` (seçili düğümlerin ataları açık). */
  treeDefaultExpandAll?: boolean;
  /** Açık dallar (kontrollü). */
  treeExpandedKeys?: string[];
  onTreeExpand?: (expandedKeys: string[]) => void;
  /** Girinti kılavuz çizgileri. */
  treeLine?: boolean;
  /** Düğüm başlığını özelleştir (tetikleyicideki metin `title` olarak kalır). */
  titleRender?: (node: TreeNode) => React.ReactNode;
  disabled?: boolean;
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu (`error`/`warning`) ya da vurgu rengi — Input'la aynı kural. */
  color?: ColorRole;
  /** Varsayılan: `"bottom-start"`. */
  placement?: Extract<Placement, "bottom-start" | "bottom-end" | "top-start" | "top-end">;
  /** Panel en fazla bu yükseklikte, sonra kayar. Varsayılan: `"16rem"`. */
  listHeight?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  /** Native form gönderimi için gizli alan(lar)ın adı. */
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export interface TreeSelectSingleProps extends TreeSelectBaseProps {
  mode?: undefined;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, node: TreeNode | null) => void;
}

export interface TreeSelectMultipleProps extends TreeSelectBaseProps {
  /**
   * `multiple`: düğümler bağımsız seçilir (etiketler), panel açık kalır.
   * `checkable`: onay kutuları; üst ↔ alt işaret yayılımı (Tree ile aynı).
   */
  mode: "multiple" | "checkable";
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], nodes: TreeNode[]) => void;
  /** `checkable`da değere yazılacak düğümler. Varsayılan: `"child"`. */
  showCheckedStrategy?: TreeSelectCheckedStrategy;
  /** `checkable`da yayılımı kapatır: her düğüm bağımsız işaretlenir. */
  treeCheckStrictly?: boolean;
  /** En fazla bu kadar etiket, kalanı "+N". Varsayılan: hepsi (satırlara sarar). */
  maxTagCount?: number;
}

export type TreeSelectProps = TreeSelectSingleProps | TreeSelectMultipleProps;
