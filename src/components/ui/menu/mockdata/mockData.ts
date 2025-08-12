import { MenuItemType } from "../types";

export const menuMockData: MenuItemType[] = [
  {
    title: "Navigation One",
    key: "1",
    iconName: "MailIcon",
    route: "/",
    disabled: true,
    children: [
      {
        title: "Item 1",
        description: "açıklama",
        key: "1-1",
        iconName: "MailIcon",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "1-2",
        iconName: "MailIcon",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "1-3",
        iconName: "MailIcon",
        route: "/",
      },
    ],
  },
  {
    title: "Navigation Two",
    key: "2",
    iconName: "AppWindowIcon",
    disabled: true,
    route: "/",
    children: [
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-1",
        iconName: "AppWindowIcon",
        route: "/ahmet",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-2",
        iconName: "AppWindowIcon",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-3",
        iconName: "AppWindowIcon",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-4",
        iconName: "AppWindowIcon",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-5",
        iconName: "AppWindowIcon",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-6",
        iconName: "AppWindowIcon",
        route: "/",
      },
    ],
  },
  {
    title: "Navigation Three - Submenu",
    key: "3",
    iconName: "SettingsIcon",
    children: [
      {
        title: "Item 1",
        description: "açıklama",
        key: "3-1",
        route: "/",
        iconName: "SettingsIcon",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "3-2",
        route: "/",
        iconName: "SettingsIcon",
      },
    ],
  },
  {
    key: "4",
    title: "Navigation Four - Link",
    route: "/",
    children: [
      {
        title: "Item 1",
        description: "açıklama",
        key: "4-1",
        route: "/",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "4-2",
        route: "/",
      },
    ],
  },
];
