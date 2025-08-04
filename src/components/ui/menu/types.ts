export type MenuItem = {
  label: string;
  key: string;
  iconName?: string;
  disabled?: boolean;
  children?: MenuItem[];
};

export type MenuItemIcon = {
  key: string;
  icon: React.ReactNode;
  children?: MenuItemIcon[];
};
