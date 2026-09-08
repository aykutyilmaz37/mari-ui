import type { Meta, StoryObj } from "@storybook/react";
import { AppWindowIcon, DatabaseIcon, MailIcon, SettingsIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { MenuItemType } from "../types";

/**
 * Not: eskiden her öğe `iconName: "AppWindowIcon"` gibi bir STRING taşıyordu
 * ve silinmiş bir `mock-data/mockIconData` dosyasından ad->component
 * eşlemesi yapılıyordu (bkz. plan Faz 0/3 — bu import çalışmıyordu). Artık
 * `icon: React.ReactNode` doğrudan geçiliyor.
 */
const icon = (Icon: typeof AppWindowIcon) => <Icon size={18} />;

const baseData: MenuItemType[] = [
  { key: "dashboard", title: "Panel", route: "/dashboard", icon: icon(AppWindowIcon) },
  {
    key: "products",
    title: "Ürünler",
    icon: icon(DatabaseIcon),
    children: [
      { key: "all-products", title: "Tüm Ürünler", route: "/products", icon: icon(DatabaseIcon) },
      { key: "categories", title: "Kategoriler", route: "/products/categories", icon: icon(SettingsIcon) },
      {
        key: "manage",
        title: "Yönet",
        icon: icon(SettingsIcon),
        children: [
          { key: "create", title: "Oluştur", route: "/products/create", icon: icon(AppWindowIcon) },
          { key: "inventory", title: "Envanter", route: "/products/inventory", icon: icon(DatabaseIcon) },
        ],
      },
    ],
  },
  {
    key: "services",
    title: "Hizmetler",
    icon: icon(SettingsIcon),
    children: [
      { key: "web-dev", title: "Web Geliştirme", route: "/services/web", description: "Frontend ve backend çözümleri", icon: icon(AppWindowIcon) },
      { key: "design", title: "Tasarım", route: "/services/design", description: "UI/UX ve grafik tasarım", icon: icon(MailIcon) },
      { key: "consulting", title: "Danışmanlık", route: "/services/consulting", description: "Teknik danışmanlık", icon: icon(SettingsIcon) },
    ],
  },
  { key: "messages", title: "Mesajlar", route: "/messages", icon: icon(MailIcon) },
  { key: "settings", title: "Ayarlar", route: "/settings", icon: icon(SettingsIcon) },
];

const disabledData: MenuItemType[] = [...baseData, { key: "billing", title: "Faturalama (Devre Dışı)", route: "/billing", icon: icon(DatabaseIcon), disabled: true }];

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Dikey gezinme menüsü. Alt öğeler `variant=\"hover\"` iken üzerine gelince, `variant=\"click\"` iken " +
          "tıklanınca açılır; `dropdown`/`mega` ile alt öğelerin akordeon yerine bir dropdown veya mega-panel " +
          "olarak açılması sağlanır. `onlyIcon` sidebar'ı sadece ikonlarla daraltır.",
      },
    },
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["hover", "click"], description: "Alt menülerin açılma tetikleyicisi." },
    position: { control: { type: "radio" }, options: ["left", "right"], description: "Sidebar'ın ekrandaki kenarı." },
    onlyIcon: { control: { type: "boolean" }, description: "Sidebar'ı sadece ikonlarla daraltır." },
    dropdown: { control: { type: "boolean" }, description: "Alt öğeleri akordeon yerine bir dropdown panelde açar." },
    mega: { control: { type: "boolean" }, description: "Alt öğeleri bir mega-menu panelinde açar." },
  },
  args: {
    data: baseData,
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const HoverLeftAccordion: Story = {
  name: "Hover / Sol / Akordeon",
  args: { variant: "hover", position: "left", dropdown: false, mega: false },
};

export const HoverRightAccordion: Story = {
  name: "Hover / Sağ / Akordeon",
  args: { variant: "hover", position: "right", dropdown: false, mega: false },
};

export const HoverDropdownLeft: Story = {
  name: "Hover / Sol / Dropdown",
  args: { variant: "hover", position: "left", dropdown: true, mega: false },
};

export const HoverDropdownRight: Story = {
  name: "Hover / Sağ / Dropdown",
  args: { variant: "hover", position: "right", dropdown: true, mega: false },
};

export const HoverMega: Story = {
  name: "Hover / Mega",
  args: { variant: "hover", position: "left", dropdown: false, mega: true },
};

export const ClickLeft: Story = {
  name: "Tık / Sol",
  args: { variant: "click", position: "left", dropdown: false, mega: false },
};

export const ClickRight: Story = {
  name: "Tık / Sağ",
  args: { variant: "click", position: "right", dropdown: false, mega: false },
};

export const OnlyIconCollapsed: Story = {
  name: "Sadece İkon (Daraltılmış)",
  args: { variant: "click", position: "left", onlyIcon: true, dropdown: false, mega: false },
};

export const WithDisabledItems: Story = {
  name: "Devre Dışı Öğeler",
  args: { data: disabledData, variant: "hover", position: "left", dropdown: false, mega: false },
};

export const WithCustomLogo: Story = {
  name: "Özel Logo",
  args: {
    variant: "hover",
    position: "left",
    logo: <img src="/images/avatar.png" alt="logo" className="w-8 h-8 rounded-full" />,
  },
};
