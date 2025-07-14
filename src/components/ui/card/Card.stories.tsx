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
    extra: <button className="text-sm text-blue-500">More</button>,
  },
};

export const WithCover: Story = {
  args: {
    title: "Card with Cover",
    cover: <img src="https://via.placeholder.com/300x120" alt="cover" />,
  },
};

export const Borderless: Story = {
  args: {
    title: "Borderless Card",
    variant: "borderless",
  },
};

export const Hoverable: Story = {
  args: {
    title: "Hoverable Card",
    hoverable: true,
  },
};

export const Loading: Story = {
  args: {
    title: "Loading Card",
    loading: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card title="Small" size="small">
        Small card content
      </Card>
      <Card title="Middle" size="middle">
        Middle card content
      </Card>
      <Card title="Big" size="big">
        Big card content
      </Card>
    </div>
  ),
};

export const InnerType: Story = {
  args: {
    title: "Inner Card",
    type: "inner",
  },
};
