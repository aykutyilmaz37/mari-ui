export type MenuItemType = {
  title: string;
  description?: string;
  key: string;
  iconName?: string;
  disabled?: boolean;
  route?: string;
  children?: MenuItemType[];
};

export type MenuItemIcon = {
  key: string;
  icon: React.ReactNode;
  children?: MenuItemIcon[];
};

export type MenuItemJustify = "left" | "center" | "right";

export type MenuPosition = "default" | "sticky" | "fixed";

export type mode = "vertical" | "horizontal";

export type SidebarVariant = "hover" | "click";

export type SidebarPosition = "left" | "right";
