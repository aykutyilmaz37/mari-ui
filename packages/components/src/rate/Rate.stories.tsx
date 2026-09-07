import type { Meta, StoryObj } from "@storybook/react";
import { Rate } from "./Rate";

const meta: Meta<typeof Rate> = {
  title: "Components/Rate",
  component: Rate,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Rate>;

export const Default: Story = {
  args: {
    defaultValue: 3,
    onChange: (value) => console.log("Changed:", value),
  },
};

export const AllowHalf: Story = {
  args: {
    allowHalf: true,
    defaultValue: 2.5,
    onChange: (value) => console.log("Changed:", value),
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 4.5,
    allowHalf: true,
    characterSize: 30,
    characterColor: "#d1d5db", // Tailwind gray-300
    disabled: true,
  },
};

export const CustomColorAndSize: Story = {
  args: {
    defaultValue: 10,
    characterColor: "rgba(67, 179, 168, 1)",
    characterSize: 32,
  },
};

export const WithAutoFocus: Story = {
  args: {
    defaultValue: 2,
    autoFocus: true,
  },
};
