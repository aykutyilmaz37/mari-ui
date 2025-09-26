import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar";
import type { MenuItemType } from "../types";

const baseData: MenuItemType[] = [
  { key: "dashboard", title: "Dashboard", route: "/dashboard", iconName: "AppWindowIcon" },
  {
    key: "products",
    title: "Products",
    iconName: "DatabaseIcon",
    children: [
      { key: "all-products", title: "All Products", route: "/products", iconName: "DatabaseIcon" },
      { key: "categories", title: "Categories", route: "/products/categories", iconName: "SettingsIcon" },
      {
        key: "manage",
        title: "Manage",
        iconName: "SettingsIcon",
        children: [
          { key: "create", title: "Create", route: "/products/create", iconName: "AppWindowIcon" },
          { key: "inventory", title: "Inventory", route: "/products/inventory", iconName: "DatabaseIcon" },
        ],
      },
    ],
  },
  {
    key: "services",
    title: "Services",
    iconName: "SettingsIcon",
    children: [
      {
        key: "web-dev",
        title: "Web Development",
        route: "/services/web",
        description: "Frontend ve backend çözümleri",
        iconName: "AppWindowIcon",
      },
      {
        key: "design",
        title: "Design",
        route: "/services/design",
        description: "UI/UX ve grafik tasarım",
        iconName: "MailIcon",
      },
      {
        key: "consulting",
        title: "Consulting",
        route: "/services/consulting",
        description: "Teknik danışmanlık",
        iconName: "SettingsIcon",
      },
    ],
  },
  { key: "messages", title: "Messages", route: "/messages", iconName: "MailIcon" },
  { key: "settings", title: "Settings", route: "/settings", iconName: "SettingsIcon" },
];

const disabledData: MenuItemType[] = [
  ...baseData,
  { key: "billing", title: "Billing (Disabled)", route: "/billing", iconName: "DatabaseIcon", disabled: true },
];

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["hover", "click"],
    },
    position: {
      control: { type: "radio" },
      options: ["left", "right"],
    },
    onlyIcon: { control: { type: "boolean" } },
    dropdown: { control: { type: "boolean" } },
    mega: { control: { type: "boolean" } },
  },
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const HoverLeftAccordion: Story = {
  name: "Hover / Left / Accordion",
  args: {
    data: baseData,
    variant: "hover",
    position: "left",
    dropdown: false,
    mega: false,
  },
};

export const HoverRightAccordion: Story = {
  name: "Hover / Right / Accordion",
  args: {
    data: baseData,
    variant: "hover",
    position: "right",
    dropdown: false,
    mega: false,
  },
};

export const HoverDropdownLeft: Story = {
  name: "Hover / Left / Dropdown",
  args: {
    data: baseData,
    variant: "hover",
    position: "left",
    dropdown: true,
    mega: false,
  },
};

export const HoverDropdownRight: Story = {
  name: "Hover / Right / Dropdown",
  args: {
    data: baseData,
    variant: "hover",
    position: "right",
    dropdown: true,
    mega: false,
  },
};

export const HoverMega: Story = {
  name: "Hover / Mega",
  args: {
    data: baseData,
    variant: "hover",
    position: "left",
    dropdown: false,
    mega: true,
  },
};

export const ClickLeft: Story = {
  name: "Click / Left",
  args: {
    data: baseData,
    variant: "click",
    position: "left",
    dropdown: false,
    mega: false,
  },
};

export const ClickRight: Story = {
  name: "Click / Right",
  args: {
    data: baseData,
    variant: "click",
    position: "right",
    dropdown: false,
    mega: false,
  },
};

export const OnlyIconCollapsed: Story = {
  name: "Only Icon (Collapsed)",
  args: {
    data: baseData,
    variant: "click",
    position: "left",
    onlyIcon: true,
    dropdown: false,
    mega: false,
  },
};

export const WithDisabledItems: Story = {
  name: "Disabled Items",
  args: {
    data: disabledData,
    variant: "hover",
    position: "left",
    dropdown: false,
    mega: false,
  },
};

export const WithCustomLogo: Story = {
  name: "Custom Logo",
  args: {
    data: baseData,
    variant: "hover",
    position: "left",
    logo: "/images/avatar.png",
  },
};


