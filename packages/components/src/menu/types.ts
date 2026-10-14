import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { LinkBehaviorProps } from "../lib/linkBehavior";

/**
 * `target` (`_blank` → yeni sekme) ve `reloadDocument` (router'ı atlayıp tam
 * sayfa yükleme) `LinkBehaviorProps`tan gelir; bu öğeler `onNavigate`e
 * devredilmez. Dış adresler (`https:`, `mailto:`…) de otomatik olarak tarayıcıya bırakılır.
 */
export interface MenuItemType extends LinkBehaviorProps {
  title: string;
  description?: string;
  key: string;
  /*
   * Eskiden `iconName: string` idi ve silinmiş bir `mock-data/mockIconData`
   * dosyasından ad->component eşleme yapıyordu. Artık tüketici ikonu doğrudan geçiriyor.
   */
  /** Öğenin başındaki ikon. */
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
/** `target`/`reloadDocument` menü öğeleriyle aynı anlamda (bkz. `LinkBehaviorProps`). */
export interface MenuPromoTile extends LinkBehaviorProps {
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

/*
 * Eskiden her menü dosyası `next/navigation`'ın `useRouter`/`usePathname`
 * hook'larına doğrudan bağımlıydı — bu paket bir Next.js uygulaması değil. Artık
 * navigasyon tüketiciden gelen bir callback; route bilgisini tüketici
 * hangi router'ı kullanıyorsa (Next, React Router, düz `<a>`) onunla eşler.
 */
/** Menülerin ortak gezinme özellikleri: router'dan bağımsız `onNavigate` ve aktif öğe için `currentPath`. */
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
