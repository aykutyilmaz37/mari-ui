import type { Meta, StoryObj } from "@storybook/react";
import Image from "next/image";
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
    extra: <button className="text-sm text-blue-500">More</button>,
  },
};

export const WithCover: Story = {
  args: {
    title: "Card with Cover",
    className: "w-[400px]",
    cover: (
      <Image
        width={400}
        height={400}
        src="https://placehold.co/400x400"
        alt="cover"
      />
    ),
  },
};

export const Borderless: Story = {
  args: {
    className: "w-[400px]",
    title: "Borderless Card",
    variant: "borderless",
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
      <Card className="w-[400px]" title="Small" size="small">
        Small card content
      </Card>
      <Card className="w-[400px]" title="Middle" size="middle">
        Middle card content
      </Card>
      <Card className="w-[400px]" title="Big" size="large">
        Big card content
      </Card>
    </div>
  ),
};

export const InnerType: Story = {
  args: {
    className: "w-[400px]",
    title: "Inner Card",
    type: "inner",
  },
};
