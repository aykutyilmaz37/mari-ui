import { cn, type ColorRole } from "@mari-ui/core";
import { borderColorClass, textClass } from "../lib/colorClasses";
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

export function getItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  const isActive = isMenuItemActive(item, activeKey);
  return isActive
    ? cn(textClass[color], borderColorClass[color], "rounded-b-none border-b-2 transition-all duration-150")
    : "rounded-b-none hover:border-b-2 transition-all duration-150";
}

export function getSidebarItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  return isMenuItemActive(item, activeKey) ? textClass[color] : "";
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
