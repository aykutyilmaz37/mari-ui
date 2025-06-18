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
  args: {
    type: "vertical",
    variant: "dotted",
    children: "`Lorem Ipsum is simply dummy text of the printing and typesetting\nindustry. Lorem Ipsum has been the industry's standard dummy text\never since the 1500s, when an unknown printer took a galley of\ntype and scrambled it to make a type specimen book. It has\nsurvived not only five centuries, but also the leap into\nelectronic typesetting, remaining essentially unchanged. It was\npopularised in the 1960s with the release of Letraset sheets\ncontaining Lorem Ipsum passages, and more recently with desktop\npublishing software like Aldus PageMaker including versions of\nLorem Ipsum.`,"
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
