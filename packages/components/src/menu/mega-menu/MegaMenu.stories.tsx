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
  parameters: {
    docs: {
      description: {
        component:
          "`BasicMenu`nun genişletilmiş hâli: `children`'ı olan öğeler üzerine gelindiğinde (hover) tam genişlikte " +
          "bir alt panel (mega menu) açar; her alt öğe için bir `description` gösterebilir. `onNavigate` " +
          "verilmezse `window.location.href` ile tam sayfa geçiş yapar.",
      },
    },
  },
  argTypes: {
    menuItemPosition: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
    menuPosition: { control: "select", options: ["default", "sticky", "fixed"], description: "Menünün sayfa kaydırmasına göre konumlanma davranışı." },
  },
  args: {
    data: mockData,
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof MegaMenu>;

export const Default: Story = {
  name: "Varsayılan",
};

export const LeftAligned: Story = {
  name: "Sola Yaslı",
  args: { menuItemPosition: "left" },
};

export const RightAligned: Story = {
  name: "Sağa Yaslı",
  args: { menuItemPosition: "right" },
};

export const StickyPosition: Story = {
  name: "Yapışkan (Sticky) Konum",
  args: { menuPosition: "sticky" },
};

export const FixedPosition: Story = {
  name: "Sabit (Fixed) Konum",
  args: { menuPosition: "fixed" },
};
