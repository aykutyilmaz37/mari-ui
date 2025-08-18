import { MenuItemType } from "../types";

export const menuMockData: MenuItemType[] = [
  {
    title: "Navigation One",
    key: "1",
    iconName: "MailIcon",
    disabled: false,
    children: [
      {
        title: "Item 1",
        description: "açıklama",
        key: "1-1",
        iconName: "MailIcon",
        children: [
          {
            title: "Item 1",
            description: "açıklama",
            key: "1-1",
            iconName: "MailIcon",
            route: "/1-1",
          },
          {
            title: "Item 1",
            description: "açıklama",
            key: "1-2",
            iconName: "MailIcon",
            route: "/1-2",
          },
          {
            title: "Item 1",
            description: "açıklama",
            key: "1-3",
            iconName: "MailIcon",
            route: "/1-3",
          },
        ],
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "1-2",
        iconName: "MailIcon",
        route: "/1-2",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "1-3",
        iconName: "MailIcon",
        route: "/1-3",
      },
    ],
  },
  {
    title: "Navigation Two",
    key: "2",
    iconName: "AppWindowIcon",
    disabled: false,
    route: "/2",
  },
  {
    title: "Navigation Three",
    key: "3",
    iconName: "SettingsIcon",
    disabled: true,
  },
  {
    key: "4",
    title: "Navigation Four - Link",
    iconName: "DatabaseIcon",
    children: [
      {
        title: "Item 1",
        description: "açıklama",
        key: "4-1",
        route: "/4-1",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "4-2",
        route: "/4-2",
      },
    ],
  },
];
