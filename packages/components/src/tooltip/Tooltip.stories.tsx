import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Info } from "lucide-react";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip
      content="This is a tooltip"
      trigger={<button className="px-4 py-2 bg-gray-200">Hover me</button>}
    />
  ),
};

export const AllPlacements: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 justify-center items-center p-10 mt-20">
      <Tooltip content="Top tooltip" placement="top" trigger={<Info />} />
      <Tooltip content="Bottom tooltiptooltiptooltiptooltip tooltiptooltiptooltiptooltip" placement="bottom" trigger={<Info />} />
      <Tooltip content="Left tooltip" placement="left" trigger={<Info />} />
      <Tooltip content="Right tooltip" placement="right" trigger={<Info />} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-4 mt-10">
      <Tooltip content="Primary tooltip" color="primary" trigger={<Info />} />
      <Tooltip content="Success tooltip" color="success" trigger={<Info />} />
      <Tooltip content="Warning tooltip" color="warning" trigger={<Info />} />
      <Tooltip
        content="Secondary tooltip"
        color="neutral"
        trigger={<Info />}
      />
      <Tooltip content="Info tooltip" color="info" trigger={<Info />} />
      <Tooltip content="Error tooltip" color="error" trigger={<Info />} />
    </div>
  ),
};
