import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbProps } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  argTypes: {
    separator: { control: "text" },
    className: { control: false },
    itemRender: { control: false },
    params: { control: false },
  },
};

export default meta;

export const Default: StoryObj<BreadcrumbProps> = {
  args: {
    items: [
      { title: "Home", href: "/" },
      { title: "Category", href: "/category" },
      { title: "Product", path: "product" },
    ],
    separator: "/",
  },
};

export const CustomSeparator: StoryObj<BreadcrumbProps> = {
  args: {
    items: [
      { title: "Dashboard", href: "/dashboard" },
      { title: "Settings", href: "/dashboard/settings" },
    ],
    separator: "→",
  },
};

export const WithItemRender: StoryObj<BreadcrumbProps> = {
  args: {
    items: [
      { title: "A", path: "a" },
      { title: "B", path: "b" },
      { title: "C", path: "c" },
    ],
    itemRender: (route, _params, _routes, paths) => (
      <a href={`/${paths.join("/")}`} className="text-blue-500 hover:underline">
        {route.title}
      </a>
    ),
  },
};
