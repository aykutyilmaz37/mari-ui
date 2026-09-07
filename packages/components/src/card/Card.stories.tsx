import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    children: "This is the card content.",
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  args: {
    title: "Card Title",
    className: "w-[400px]",
    extra: <button className="text-sm text-mari-primary">More</button>,
  },
};

export const WithCoverAndFooter: Story = {
  args: {
    title: "Card with Cover",
    className: "w-[400px]",
    cover: <img width={400} height={200} src="https://placehold.co/400x200" alt="cover" />,
    footer: <span className="text-sm text-mari-muted">Son güncelleme: bugün</span>,
  },
};

export const Borderless: Story = {
  args: {
    className: "w-[400px]",
    title: "Borderless Card",
    bordered: false,
  },
};

export const Hoverable: Story = {
  args: {
    className: "w-[400px]",
    title: "Hoverable Card",
    hoverable: true,
  },
};

export const Loading: Story = {
  args: {
    className: "w-[400px]",
    title: "Loading Card",
    loading: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-[400px]" title="Small" size="sm">
        Small card content
      </Card>
      <Card className="w-[400px]" title="Medium" size="md">
        Medium card content
      </Card>
      <Card className="w-[400px]" title="Large" size="lg">
        Large card content
      </Card>
    </div>
  ),
};

export const Inset: Story = {
  args: {
    className: "w-[400px]",
    title: "Inset Card",
    inset: true,
  },
};
