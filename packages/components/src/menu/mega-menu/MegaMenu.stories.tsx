import type { Meta, StoryObj } from "@storybook/react";
import { MegaMenu } from "./MegaMenu";
import type { MenuItemType } from "../types";

const mockData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/home" },
  { key: "about", title: "Hakkımızda", route: "/about" },
  {
    key: "services",
    title: "Hizmetler",
    children: [
      { key: "web-dev", title: "Web Geliştirme", route: "/services/web", description: "Frontend ve backend çözümleri." },
      { key: "design", title: "Tasarım", route: "/services/design", description: "UI/UX ve grafik tasarım hizmetleri." },
    ],
  },
  { key: "contact", title: "İletişim", route: "/contact" },
];

const meta: Meta<typeof MegaMenu> = {
  component: MegaMenu,
  title: "Components/MegaMenu",
  tags: ["autodocs"],
  args: {
    data: mockData,
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof MegaMenu>;

export const Default: Story = {};

export const LeftAligned: Story = {
  args: { menuItemPosition: "left" },
};

export const RightAligned: Story = {
  args: { menuItemPosition: "right" },
};

export const StickyPosition: Story = {
  args: { menuPosition: "sticky" },
};

export const FixedPosition: Story = {
  args: { menuPosition: "fixed" },
};
