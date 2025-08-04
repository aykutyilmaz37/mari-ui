"use client";

import { Menu } from "@/components/ui/menu";
import { MenuItem } from "@/components/ui/menu/types";

const items: MenuItem[] = [
  {
    label: "Navigation One",
    key: "mail",
    iconName: "MailIcon",
  },
  {
    label: "Navigation Two",
    key: "app",
    iconName: "AppWindowIcon",
    disabled: true,
  },
  {
    label: "Navigation Three - Submenu",
    key: "SubMenu",
    iconName: "SettingsIcon",
    children: [
      {
        label: "Item 1",
        key: "item1",
        children: [
          { label: "Option 1", key: "setting:1" },
          { label: "Option 2", key: "setting:2" },
        ],
      },
      {
        label: "Item 2",
        key: "item2",
        children: [
          { label: "Option 3", key: "setting:3" },
          { label: "Option 4", key: "setting:4" },
        ],
      },
    ],
  },
  {
    key: "alipay",
    label: "Navigation Four - Link",
  },
];

export default function Page() {
  return (
    <div className="p-2">
      <Menu mode="horizontal" data={items} />
    </div>
  );
}
