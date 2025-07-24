import type { Meta, StoryObj } from "@storybook/react";
import { Empty } from "./Empty";
import { RefreshCcw } from "lucide-react";

const meta: Meta<typeof Empty> = {
  title: "Components/Empty",
  component: Empty,
  tags: ["autodocs"],
  args: {
    title: "No Data Available",
    description: "We couldn’t find any data matching your criteria.",
    buttonText: "Retry",
    buttonIcon: <RefreshCcw size={16} />,
    onClick: () => alert("Retry clicked"),
  },
};

export default meta;

type Story = StoryObj<typeof Empty>;

export const Default: Story = {};
