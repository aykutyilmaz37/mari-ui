import type { Meta, StoryObj } from "@storybook/react";
import { BasicMenu } from "./BasicMenu";
import type { MenuItemType } from "../types";

const mockData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/home" },
  { key: "about", title: "Hakkımızda", route: "/about" },
  {
    key: "services",
    title: "Hizmetler",
    children: [
      { key: "web-dev", title: "Web Geliştirme", route: "/services/web" },
      { key: "design", title: "Tasarım", route: "/services/design" },
    ],
  },
  { key: "contact", title: "İletişim", route: "/contact" },
];

/**
 * Not: `onNavigate` verilmediğinde bu component `window.location.href`
 * ile tam sayfa geçişi yapar. Storybook'ta gerçek navigasyonu önlemek için
 * her story burada bir no-op `onNavigate` geçiyor.
 */
const meta: Meta<typeof BasicMenu> = {
  component: BasicMenu,
  title: "Components/BasicMenu",
  tags: ["autodocs"],
  args: {
    data: mockData,
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof BasicMenu>;

export const Default: Story = {};

export const LeftAligned: Story = {
  args: { menuItemJustify: "left" },
};

export const RightAligned: Story = {
  args: { menuItemJustify: "right" },
};

export const StickyPosition: Story = {
  args: { menuPosition: "sticky" },
};

export const FixedPosition: Story = {
  args: { menuPosition: "fixed" },
};
