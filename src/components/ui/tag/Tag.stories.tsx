import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag";
import { CheckCircle, Info, XCircle } from "lucide-react";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  args: {
    children: "Tag Label",
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: <Info size={14} />,
  },
};

export const Closable: Story = {
  args: {
    closeIcon: true,
  },
};

export const CustomCloseIcon: Story = {
  args: {
    closeIcon: <XCircle size={14} />,
  },
};

export const WithoutBorder: Story = {
  args: {
    bordered: false,
  },
};

export const StatusTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag statu="success" icon={<CheckCircle size={14} />}>
        Success
      </Tag>
      <Tag statu="processing">Processing</Tag>
      <Tag statu="error">Error</Tag>
      <Tag statu="warning">Warning</Tag>
      <Tag statu="default">Default</Tag>
    </div>
  ),
};

export const CustomHexColor: Story = {
  args: {
    color: "#db2777",
  },
};

export const MixedUsage: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag statu="success" icon={<CheckCircle size={14} />} closeIcon>
        Success Tag
      </Tag>
      <Tag
        color="#eab308"
        icon={<Info size={14} />}
        closeIcon={<XCircle size={14} />}
      >
        Custom Color
      </Tag>
    </div>
  ),
};
