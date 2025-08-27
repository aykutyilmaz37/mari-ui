import { Meta, StoryObj } from "@storybook/react";
import { TimePicker } from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "Components/TimePicker",
  component: TimePicker,
  argTypes: {
    onChange: { action: "changed" },
    timeType: {
      options: ["usa", "eu"],
      control: { type: "radio" },
    },
    dropdown: {
      control: { type: "boolean" },
    },
    size: {
      options: ["small", "middle", "large"],
      control: { type: "radio" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {};

export const USAType: Story = {
  args: {
    timeType: "usa",
  },
};

export const EuroType: Story = {
  args: {
    timeType: "eu",
  },
};

export const Dropdown: Story = {
  args: {
    dropdown: true,
    timeType: "usa"
  },
};

export const SmallSize: Story = {
  args: {
    size: "small",
  },
};

export const MiddleSize: Story = {
  args: {
    size: "middle",
  },
};

export const LargeSize: Story = {
  args: {
    size: "large",
  },
};
