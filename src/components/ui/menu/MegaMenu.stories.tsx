import type { Meta, StoryObj } from "@storybook/react";
import { MegaMenu } from "./MegaMenu";
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
        description: "Frontend and backend solutions.",
      },
      {
        key: "design",
        title: "Design",
        route: "/services/design",
        description: "UI/UX and graphic design services.",
      },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    route: "/contact",
  },
];

const meta: Meta<typeof MegaMenu> = {
  component: MegaMenu,
  title: "Components/MegaMenu",
};

export default meta;

type Story = StoryObj<typeof MegaMenu>;

export const Default: Story = {
  args: {
    data: mockData,
  },
};

export const LeftAligned: Story = {
  args: {
    data: mockData,
    menuItemPosition: "left",
  },
};

export const RightAligned: Story = {
  args: {
    data: mockData,
    menuItemPosition: "right",
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
