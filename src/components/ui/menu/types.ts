export type MenuItemType = {
  label: string;
  key: string;
  iconName?: string;
  disabled?: boolean;
  direction?: "top" | "bottom" | "right" | "left";
  route?: string;
  children?: MenuItemType[];
};

export type MenuItemIcon = {
  key: string;
  icon: React.ReactNode;
  children?: MenuItemIcon[];
};

export type MenuItemPosition = "left" | "center" | "right";

export type mode = 'vertical' | 'horizontal'