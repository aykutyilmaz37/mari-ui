import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 95,
    onPageChange: (page) => console.log("Page changed:", page),
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    pageSize: 10,
    totalItems: 95,
    onPageChange: (page) => console.log("Page changed:", page),
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    pageSize: 10,
    totalItems: 95,
    onPageChange: (page) => console.log("Page changed:", page),
  },
};
