import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Info, XCircle } from "lucide-react";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "accent", "success", "error", "warning", "info", "neutral"],
    },
    variant: { control: "select", options: ["solid", "soft", "outline"] },
  },
  args: {
    children: "Tag Label",
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: { icon: <Info size={14} /> },
};

export const Closable: Story = {
  args: { onClose: () => {} },
};

export const CustomCloseIcon: Story = {
  args: { onClose: () => {}, closeIcon: <XCircle size={14} /> },
};

export const Bordered: Story = {
  args: { bordered: true },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["primary", "accent", "success", "error", "warning", "info", "neutral"] as const).map((color) => (
        <Tag key={color} color={color} icon={color === "success" ? <CheckCircle size={14} /> : undefined}>
          {color}
        </Tag>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["solid", "soft", "outline"] as const).map((variant) => (
        <Tag key={variant} color="primary" variant={variant}>
          {variant}
        </Tag>
      ))}
    </div>
  ),
};
