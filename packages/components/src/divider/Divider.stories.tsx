import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";
import type { DividerProps } from "./types";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    className: { control: false },
    lineStyle: { control: "select", options: ["solid", "dashed", "dotted"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    labelAlign: { control: "select", options: ["start", "center", "end"] },
    labelMargin: { control: "text" },
    plain: { control: "boolean" },
    style: { control: false },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;

export const Playground: StoryObj<DividerProps> = {
  args: {
    children: "Lorem Ipsum.",
    lineStyle: "solid",
    orientation: "horizontal",
    labelAlign: "center",
    labelMargin: "12px",
    plain: true,
    size: "md",
  },
};

export const Vertical: StoryObj<DividerProps> = {
  render: (args) => (
    <div className="h-40 flex items-center justify-center gap-4">
      <span>Sol</span>
      <Divider {...args} />
      <span>Sağ</span>
    </div>
  ),
  args: {
    orientation: "vertical",
    lineStyle: "dotted",
    height: "80%",
  },
};

export const DashedEndWithMargin: StoryObj<DividerProps> = {
  args: {
    children: "Sona Hizalı",
    lineStyle: "dashed",
    labelAlign: "end",
    labelMargin: 20,
    orientation: "horizontal",
  },
};
