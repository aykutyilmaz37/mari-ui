import { MenuItemPosition, MenuItemType } from "./types";

export const getMenuItemPosition = (menuItemPosition: MenuItemPosition) => {
  return {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
  }[menuItemPosition];
};

/**
 * Recursive olarak bir menü öğesinin aktif olup olmadığını kontrol eder
 * Eğer bir child aktifse, parent'ı da aktif sayılır
 */
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
    ? "text-primary rounded-b-none border-b-2 border-info"
    : "rounded-b-none hover:border-b-2 hover:border-info";
};
