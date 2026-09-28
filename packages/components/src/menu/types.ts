import type React from "react";
import type { ColorRole } from "@mari-ui/core";

export interface MenuItemType {
  title: string;
  description?: string;
  key: string;
  /** Eskiden `iconName: string` idi ve silinmiş bir `mock-data/mockIconData`
   * dosyasından ad->component eşleme yapıyordu (bkz. plan Faz 0 —
   * mock-data zaten "production ağacında olmamalı" diye kaldırılmıştı, bu
   * import ÇALIŞMIYORDU). Artık tüketici ikonu doğrudan geçiriyor. */
  icon?: React.ReactNode;
  disabled?: boolean;
  route?: string;
  children?: MenuItemType[];
  /**
   * Ray öğesi seviyesinde (children'ı `MegaPanel`de kolonlara dönüşen
   * öğede) opsiyonel promosyon kartları. Yoksa/boşsa promosyon alanı hiç
   * render edilmez (bkz. `menu/_shared/MegaPanel`).
   */
  promoTiles?: MenuPromoTile[];
  /**
   * `true` ise bu öğe etkileşimsiz bir bölüm etiketidir (Sidebar/MegaPanel
   * rail'inde): icon/chevron/hover/click YOK, sadece kalın bir başlık
   * metni. Kendi `children`'ı varsa YOK SAYILIR — gruplama, veri dizisinde
   * bu öğeden SONRA gelen kardeş öğelerle sağlanır (recursive bir
   * "children'ı sibling'lere yay" mantığı kasıtlı olarak yok).
   */
  heading?: boolean;
}

/** `MegaPanel`in promosyon ızgarasındaki tek bir kart. */
export interface MenuPromoTile {
  title: string;
  image: string;
  href?: string;
  /** Izgara kaplama boyutu. Varsayılan: `"sm"`. */
  span?: "sm" | "wide" | "full";
}

export type MenuItemJustify = "left" | "center" | "right";
export type MenuPosition = "default" | "sticky" | "fixed";
export type SidebarVariant = "hover" | "click" | "drawer";
export type SidebarPosition = "left" | "right";

/**
 * Eskiden her menü dosyası `next/navigation`'ın `useRouter`/`usePathname`
 * hook'larına doğrudan bağımlıydı — bu paket bir Next.js uygulaması değil
 * (bkz. plan: "next peer DEĞİL — kütüphane Next'e bağlı olmamalı"). Artık
 * navigasyon tüketiciden gelen bir callback; route bilgisini tüketici
 * hangi router'ı kullanıyorsa (Next, React Router, düz `<a>`) onunla eşler.
 */
export interface MenuNavigationProps {
  /** Bir menü öğesine (route'u olan) tıklandığında çağrılır. Verilmezse tam sayfa geçişi yapılır. */
  onNavigate?: (route: string) => void;
  /** Aktif öğeyi vurgulamak için mevcut yol. Next'te `usePathname()`, React Router'da `useLocation().pathname`. */
  currentPath?: string;
}

export interface MenuColorProps {
  /** Aktif/vurgu rengi. Varsayılan: `primary`. */
  color?: ColorRole;
}
