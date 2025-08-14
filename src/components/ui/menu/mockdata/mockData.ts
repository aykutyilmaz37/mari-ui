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
    title: "Navigation Two",
    key: "2",
    iconName: "AppWindowIcon",
    disabled: true,
    route: "/2",
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
        route: "/2-2",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-3",
        iconName: "AppWindowIcon",
        route: "/2-3",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-4",
        iconName: "AppWindowIcon",
        route: "/2-4",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-5",
        iconName: "AppWindowIcon",
        route: "/2-5",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "2-6",
        iconName: "AppWindowIcon",
        route: "/2-6",
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
        route: "/3-1",
        iconName: "SettingsIcon",
      },
      {
        title: "Item 1",
        description: "açıklama",
        key: "3-2",
        route: "/3-2",
        iconName: "SettingsIcon",
      },
    ],
  },
  {
    key: "4",
    title: "Navigation Four - Link",
    iconName: 'DatabaseIcon',
    route: "/4",
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
