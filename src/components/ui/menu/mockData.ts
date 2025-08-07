import { MenuItem } from "./types";

export const items: MenuItem[] = [
  {
    label: "Navigation One",
    key: "mail",
    iconName: "MailIcon",
    route: "/",
  },
  {
    label: "Navigation Two",
    key: "app",
    iconName: "AppWindowIcon",
    disabled: true,
    route: "/",
  },
  {
    label: "Navigation Three - Submenu",
    key: "SubMenu",
    iconName: "SettingsIcon",
    direction: "bottom",
    children: [
      {
        label: "Item 1",
        key: "item1",
        direction: "right",
        children: [
          { label: "Option 1", key: "setting:1", route: "/" },
          { label: "Option 2", key: "setting:2", route: "/" },
        ],
      },
      {
        label: "Item 2",
        key: "item2",
        direction: "right",
        children: [
          { label: "Option 3", key: "setting:3", route: "/" },
          { label: "Option 4", key: "setting:4", route: "/" },
        ],
      },
    ],
  },
  {
    key: "alipay",
    label: "Navigation Four - Link",
    route: "/",
  },
];
