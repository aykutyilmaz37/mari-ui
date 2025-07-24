import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./Slider";
import { Leaf } from "lucide-react";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Basic: Story = {
  args: {
    defaultValue: 50,
    onChange: (val) => console.log("value:", val),
  },
};

export const WithIcons: Story = {
  args: {
    defaultValue: 50,
    iconList: [
      { icon: <Leaf size={16} />, value: 0 },
      { icon: <Leaf size={16} />, value: 50 },
      { icon: <Leaf size={16} />, value: 100 },
    ],
    tooltipAlwaysVisible: true,
    onChange: (val) => console.log("value:", val),
  },
};

export const Vertical: Story = {
  args: {
    defaultValue: 40,
    vertical: true,
    tooltipAlwaysVisible: true,
    iconPosition: "top",
    iconList: [
      { icon: <Leaf size={16} />, value: 20 },
      { icon: <Leaf size={16} />, value: 40 },
      { icon: <Leaf size={16} />, value: 80 },
    ],
    onChange: (val) => console.log("value:", val),
    showInput: true,
  },
};

export const WithInputField: Story = {
  args: {
    defaultValue: 30,
    showInput: true,
    onChange: (val) => console.log("value:", val),
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 60,
    disabled: true,
    tooltipVisible: true,
  },
};
