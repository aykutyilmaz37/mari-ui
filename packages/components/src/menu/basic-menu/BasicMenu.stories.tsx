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
  title: "Navigasyon/BasicMenu",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Yatay üst gezinme çubuğu. `data` içindeki `children`'ı olan öğeler otomatik olarak bir dropdown açar. " +
          "`onNavigate` verilmezse `window.location.href` ile tam sayfa geçiş yapar — bir router (örn. Next.js " +
          "`useRouter`) kullanıyorsanız `onNavigate` ile client-side gezinmeye bağlayın.",
      },
    },
  },
  argTypes: {
    menuItemJustify: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
    menuPosition: { control: "select", options: ["default", "sticky", "fixed"], description: "Menünün sayfa kaydırmasına göre konumlanma davranışı." },
  },
  args: {
    data: mockData,
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof BasicMenu>;

export const Default: Story = {
  name: "Varsayılan",
};

export const LeftAligned: Story = {
  name: "Sola Yaslı",
  args: { menuItemJustify: "left" },
};

export const RightAligned: Story = {
  name: "Sağa Yaslı",
  args: { menuItemJustify: "right" },
};

export const StickyPosition: Story = {
  name: "Yapışkan (Sticky) Konum",
  args: { menuPosition: "sticky" },
};

export const FixedPosition: Story = {
  name: "Sabit (Fixed) Konum",
  args: { menuPosition: "fixed" },
};
