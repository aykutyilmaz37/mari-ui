import { MenuItemType } from "./types";

export const items: MenuItemType[] = [
  {
    label: "Navigation One",
    key: "1",
    iconName: "MailIcon",
    route: "/",
  },
  {
    label: "Navigation Two",
    key: "2",
    iconName: "AppWindowIcon",
    disabled: true,
    route: "/",
  },
  {
    label: "Navigation Three - Submenu",
    key: "3",
    iconName: "SettingsIcon",
    direction: "bottom",
    children: [
      {
        label: "Item 1",
        key: "3-1",
        direction: "right",
        children: [
          { label: "Option 1", key: "3-1-1", route: "/" },
          { label: "Option 2", key: "3-1-2", route: "/" },
        ],
      },
      {
        label: "Item 2",
        key: "3-2",
        direction: "right",
        children: [
          { label: "Option 3", key: "3-2-1", route: "/" },
          { label: "Option 4", key: "3-2-2", route: "/" },
        ],
      },
    ],
  },
  {
    key: "4",
    label: "Navigation Four - Link",
    route: "/",
  },
];
