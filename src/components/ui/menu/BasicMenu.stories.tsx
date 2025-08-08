import { Meta, StoryObj } from "@storybook/react";
import { BasicMenu } from "./BasicMenu";
import { MenuItemType } from "./types";

const mockData: MenuItemType[] = [
  {
    key: "home",
    title: "Home",
    route: "/home",
  },
  {
    key: "about",
    title: "About",
    route: "/about",
  },
  {
    key: "services",
    title: "Services",
    children: [
      {
        key: "web-dev",
        title: "Web Development",
        route: "/services/web",
      },
      {
        key: "design",
        title: "Design",
        route: "/services/design",
      },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    route: "/contact",
  },
];

const meta: Meta<typeof BasicMenu> = {
  component: BasicMenu,
  title: "Components/BasicMenu",
};

export default meta;

type Story = StoryObj<typeof BasicMenu>;

export const Default: Story = {
  args: {
    data: mockData,
  },
};

export const LeftAligned: Story = {
  args: {
    data: mockData,
    menuItemJustify: "left",
  },
};

export const RightAligned: Story = {
  args: {
    data: mockData,
    menuItemJustify: "right",
  },
};

export const StickyPosition: Story = {
  args: {
    data: mockData,
    menuPosition: "sticky",
  },
};

export const FixedPosition: Story = {
  args: {
    data: mockData,
    menuPosition: "fixed",
  },
};
