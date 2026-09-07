import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Bottom: Story = {
  args: {
    trigger: "Open Menu",
    children: <div className="w-40">Dropdown Content</div>,
    placement: "bottom",
  },
};

export const Top: Story = {
  args: {
    trigger: "Open Menu",
    children: <div className="w-40">Dropdown Content</div>,
    placement: "top",
  },
};

export const Left: Story = {
  args: {
    trigger: "Open Menu",
    children: <div className="w-40">Dropdown Content</div>,
    placement: "left",
  },
};

export const Right: Story = {
  args: {
    trigger: "Open Menu",
    children: <div className="w-40">Dropdown Content</div>,
    placement: "right",
  },
};

export const Hoverable: Story = {
  args: {
    trigger: "Hover Me",
    children: <div className="w-40">Hover Dropdown Content</div>,
    placement: "bottom",
    hover: true,
  },
};
