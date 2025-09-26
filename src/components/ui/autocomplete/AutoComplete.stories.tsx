import type { Meta, StoryObj } from "@storybook/react";
import { AutoComplete } from "./AutoComplete";
import { Option } from "./types";

const meta: Meta<typeof AutoComplete> = {
  title: "Components/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AutoComplete>;

const sampleOptions: Option[] = [
  { id: 1, value: "Ahmet" },
  { id: 2, value: "Aykut" },
  { id: 3, value: "Furkan" },
  { id: 4, value: "Yasemin" },
  { id: 5, value: "Sadık" },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
  },
};
