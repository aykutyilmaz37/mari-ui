export type MenuItem = {
  label: string;
  key: string;
  iconName?: string;
  disabled?: boolean;
  direction?: "top" | "bottom" | "right" | "left";
  route?: string
  children?: MenuItem[];
};

export type MenuItemIcon = {
  key: string;
  icon: React.ReactNode;
  children?: MenuItemIcon[];
};
