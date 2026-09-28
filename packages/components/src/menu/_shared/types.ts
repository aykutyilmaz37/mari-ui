import type { ColorRole } from "@mari-ui/core";
import type { MenuItemType, MenuNavigationProps } from "../types";

export interface MegaPanelProps extends MenuNavigationProps {
  /** Paneli tetikleyen üst öğenin `children`'ı — ray öğeleri. */
  items: MenuItemType[];
  color: ColorRole;
  /** `"full"`: MegaMenu'nün tam genişlikteki paneli (promosyon açık). `"compact"`: BasicMenu/Sidebar'ın tetikleyiciye sabitlenmiş paneli (promosyon kapalı, en fazla 2 kolon). */
  layout: "full" | "compact";
  /** `"vertical"`: ray üstte, kolonlar altta — Sidebar'ın yan-açılan panelleri (dar genişlik) için. Varsayılan `"horizontal"`. */
  orientation?: "horizontal" | "vertical";
  /** Bir öğeye tıklanınca (gezinmeden ÖNCE) çağrılır — host kendi panelini kapatabilsin diye. */
  onItemClick?: (item: MenuItemType) => void;
  /** Geçerli sayfanın öğe anahtarı: ray başlangıçta onu içeren kategoriyi seçer, link `aria-current="page"` + vurgu alır. */
  activeKey?: string | null;
  className?: string;
}
