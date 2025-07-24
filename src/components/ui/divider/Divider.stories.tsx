import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";
import type { DividerProps } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    className: { control: false },
    dashed: { control: "boolean" },
    variant: {
      control: "select",
      options: ["solid", "dashed", "dotted"],
    },
    orientation: {
      control: "select",
      options: ["start", "center", "end"],
    },
    orientationMargin: { control: "text" },
    plain: { control: "boolean" },
    style: { control: false },
    size: {
      control: "select",
      options: ["small", "middle", "large"],
    },
    type: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
};

export default meta;

export const Playground: StoryObj<DividerProps> = {
  args: {
    children: `
    Lorem Ipsum.`,
    dashed: false,
    variant: "solid",
    orientation: "center",
    orientationMargin: "12px",
    plain: true,
    size: "middle",
    type: "horizontal",
  },
};

export const Vertical: StoryObj<DividerProps> = {
  render: (args) => (
    <div className="h-screen flex items-center justify-center gap-4 bg-gray-50">
      <span>Left</span>
      <Divider {...args} />
      <span>Right</span>
    </div>
  ),
  args: {
    type: "vertical",
    variant: "dotted",
    children: "Lorem",
    height: "80%",
  },
};

export const DashedEndWithMargin: StoryObj<DividerProps> = {
  args: {
    children: "End Aligned",
    dashed: true,
    orientation: "end",
    orientationMargin: 20,
    type: "horizontal",
  },
};
