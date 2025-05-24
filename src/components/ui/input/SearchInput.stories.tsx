import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    size: {
      control: "select",
      options: ["large", "middle", "small"],
    },
    variant: {
      control: "select",
      options: ["outlined", "filled", "borderless", "underlined"],
    },
    status: {
      control: "select",
      options: ["error", "warning", undefined],
    },
    allowClear: { control: "boolean" },
    disabled: { control: "boolean" },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onSearch: { action: "onSearch" },
  },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  args: {
    placeholder: "Search...",
    allowClear: true,
    size: "middle",
    variant: "outlined",
    showCount: false,
    maxLength: 50,
    disabled: false,
  },
};

export const WithSearch: Story = {
  args: {
    placeholder: "Type a keyword and click search",
    onSearch: (value: string) => {
      alert(`Searching for: ${value}`);
    },
  },
};
