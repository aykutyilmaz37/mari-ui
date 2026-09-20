import { cn, type ColorRole } from "@mari-ui/core";
import { bgSubtleClass, borderColorClass, borderColorHoverClass, textClass, textHoverClass } from "../lib/colorClasses";
import type { MenuItemJustify, MenuItemType, MenuPosition, SidebarVariant } from "./types";

export function getMenuItemJustify(justify: MenuItemJustify): string {
  return { left: "justify-start", right: "justify-end", center: "justify-center" }[justify];
}

export function getMenuPosition(position: MenuPosition): string {
  return { default: "", sticky: "sticky top-0", fixed: "fixed top-0 w-full" }[position];
}

export function isMenuItemActive(item: MenuItemType, activeKey: string | null): boolean {
  if (!activeKey) return false;
  if (item.key === activeKey) return true;
  if (item.children) return item.children.some((child) => isMenuItemActive(child, activeKey));
  return false;
}

/**
 * Faz 13.5 kullanıcı bulgusu (round 2): hover'da `border-b-2` YOKTAN VARA
 * çıkıyordu — kutunun yüksekliğini aniden 2px artırıp navbar'ın TİTREMESİNE
 * (jitter) yol açıyordu. Artık `border-b-2` HER ZAMAN rezerve (şeffaf),
 * sadece hover/aktifte RENGİ değişiyor — kutu boyutu hiç değişmiyor. Primary
 * (veya seçili `color`) SADECE metin ve alt çizgi rengi olarak kullanılıyor,
 * arka plan olarak ASLA (Button zaten `ghost`/`neutral`, bkz. BasicMenuItem).
 */
export function getItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  const isActive = isMenuItemActive(item, activeKey);
  return cn(
    "border-b-2 border-transparent font-normal transition-colors duration-150",
    isActive ? cn(textClass[color], borderColorClass[color], "font-medium") : cn(textHoverClass[color], borderColorHoverClass[color])
  );
}

/**
 * Dikey bir dropdown/mega panelin İÇİNDEKİ liste satırları için — yatay
 * navbar öğelerinden (`getItemClass`, alt çizgi) FARKLI bir görsel dil:
 * gerçek menü satırları gibi hover'da yumuşak bir arka plan dolgusu (kutu
 * boyutu değişmez, jitter riski yok — genişlik/yükseklik sabit, sadece
 * arka plan rengi dolar). Aktif öğe Sidebar'daki aynı desenle (yumuşak
 * arka plan + vurgu rengi) işaretlenir.
 */
export function getMenuListItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  const isActive = isMenuItemActive(item, activeKey);
  return isActive ? cn(textClass[color], bgSubtleClass[color], "font-medium") : cn(textHoverClass[color], "hover:bg-mari-surface-alt font-normal");
}

/**
 * Faz 13.5 kullanıcı bulgusu: aktif öğe eskiden sadece metin rengiyle
 * ayırt ediliyordu — Button'ın kendi varsayılan `solid`/`primary` dolgusu
 * yüzünden zaten HER öğe koyu mavi bir buton gibi göründüğünden bu incelik
 * hiç fark edilmiyordu. `SidebarItem`/`BasicMenuItem`/`MegaMenuItem` artık
 * `variant="ghost" color="neutral"` (düz metin görünümü) kullanıyor; aktif
 * öğe gerçek modern sidebar'lardaki gibi (GitHub, Linear vb.) yumuşak bir
 * arka plan + vurgu rengiyle ayrışıyor.
 */
export function getSidebarItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  return isMenuItemActive(item, activeKey) ? cn(textClass[color], bgSubtleClass[color], "font-medium") : "";
}

/** Eskiden `w-2xs`/`w-6xl`/`w-12` gibi bir karışım kullanıyordu — `2xs`/`6xl`
 * Tailwind'in `w-*` (width) skalasında GERÇEKTEN YOK (Slider'daki
 * `w-lg`/`w-md` hatasının aynısı, bkz. plan). Gerçek genişliklerle düzeltildi. */
export function getSidebarWidthClass(variant: SidebarVariant, visible: boolean): string {
  if (variant === "hover") return visible ? "w-64" : "w-12";
  return visible ? "w-64" : "w-0";
}

export function findActiveKeyByRoute(items: MenuItemType[], route: string | undefined): string | null {
  if (!route) return null;
  for (const item of items) {
    if (item.route === route) return item.key;
    if (item.children) {
      const found = findActiveKeyByRoute(item.children, route);
      if (found) return found;
    }
  }
  return null;
}
