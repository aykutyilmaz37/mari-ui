import type { Meta, StoryObj } from "@storybook/react";
import { Tree } from "./Tree";
import { TreeData } from "./types";
import { CheckCheckIcon } from "lucide-react";

const meta: Meta<typeof Tree> = {
  title: "Components/Tree",
  component: Tree,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tree>;

const treeData: TreeData[] = [
  {
    title: "Bilet",
    key: "ticket",
    children: [
      {
        title: "Alt Bilet 1",
        key: "ticket-1",
      },
      {
        title: "Alt Bilet 2",
        key: "ticket-2",
      },
    ],
  },
  {
    title: "Zaman",
    key: "time",
    children: [
      {
        title: "Alt Zaman 1",
        key: "time-1",
      },
    ],
  },
  {
    title: "Onay",
    key: "approve",
  },
];

export const Default: Story = {
  args: {
    treeData,
  },
};

export const WithCustomIcon: Story = {
  args: {
    treeData,
    icon: <CheckCheckIcon size={10} />,
  },
};
