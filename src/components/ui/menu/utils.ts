import {
  MenuItemJustify,
  MenuItemType,
  MenuPosition,
  SidebarVariant,
} from "./types";
import { iconMap } from "./mockdata/mockIconData";

export const getMenuItemJustify = (MenuItemJustify: MenuItemJustify) => {
  return {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
  }[MenuItemJustify];
};
export const getMenuPosition = (MenuPosition: MenuPosition) => {
  return {
    default: "",
    sticky: "sticky top-0",
    fixed: "fixed top-0 w-full",
  }[MenuPosition];
};

export const isMenuItemActive = (
  item: MenuItemType,
  activeKey: string | null
): boolean => {
  if (!activeKey) return false;

  // Direkt eşleşme kontrolü
  if (item.key === activeKey) return true;

  // Children'larda aktif olan var mı kontrol et
  if (item.children) {
    return item.children.some((child) => isMenuItemActive(child, activeKey));
  }

  return false;
};

export const getClass = (item: MenuItemType, activeKey: string | null) => {
  const isActive = isMenuItemActive(item, activeKey);

  return isActive
    ? "text-primary rounded-b-none border-b-2 border-info transition-all duration-50"
    : "rounded-b-none hover:border-b-2 hover:border-info transition-all duration-50";
};
export const getClassSidebar = (item: MenuItemType, activeKey: string | null) => {
  const isActive = isMenuItemActive(item, activeKey);

  return isActive ? "text-info" : "";
};

export const resolveIconComponent = (iconName?: string) => {
  return iconName ? iconMap[iconName] : null;
};

export const getWidthClass = (variant: SidebarVariant, visible: boolean) => {
  if (variant === "hover") {
    if (visible) {
      return "w-2xs";
    } else {
      return "w-12";
    }
  }
  if (variant === "click") {
    if (visible) {
      return "w-2xs";
    } else {
      return "w-0";
    }
  }
};

export const findActiveKeyByRoute = (
  items: MenuItemType[],
  route: string
): string | null => {
  for (const item of items) {
    if (item.route === route) {
      return item.key;
    }
    if (item.children) {
      const found = findActiveKeyByRoute(item.children, route);
      if (found) {
        return found;
      }
    }
  }
  return null;
};
