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

export type MenuItemPosition = "left" | "center" | "right";

export type mode = "vertical" | "horizontal";
