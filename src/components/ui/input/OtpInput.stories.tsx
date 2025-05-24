import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { OtpInput } from "./OtpInput";

type Story = StoryObj<typeof OtpInput>;

const meta: Meta<typeof OtpInput> = {
  title: "Components/OtpInput",
  component: OtpInput,
  tags: ["autodocs"],
  argTypes: {
    length: { control: { type: "number", min: 1, max: 12 } },
    mask: { control: "boolean" },
    disabled: { control: "boolean" },
    size: {
      control: "select",
      options: ["small", "middle", "large"],
    },
    variant: {
      control: "select",
      options: ["outlined", "filled", "borderless", "underlined"],
    },
    status: {
      control: "select",
      options: ["error", "warning", undefined],
    },
    onChange: { action: "onChange" },
    onInput: { action: "onInput" },
  },
};
export default meta;

export const Playground: Story = {
  args: {
    length: 6,
    mask: false,
    disabled: false,
    size: "middle",
    variant: "outlined",
    status: undefined,
  },
};

export const Masked: Story = {
  args: {
    length: 4,
    mask: true,
    size: "middle",
    variant: "filled",
  },
};

export const WithSeparators: Story = {
  args: {
    length: 6,
    mask: false,
    separator: "-",
    size: "large",
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState("123");

  return (
    <div className="flex flex-col gap-4">
      <OtpInput value={value} onChange={(v) => setValue(v)} length={6} />
      <p className="text-sm text-muted">Current: {value || "empty"}</p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
