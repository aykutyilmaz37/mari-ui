import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/ui/input";
import type { TextareaProps } from "@/components/ui/input";
import { useState } from "react";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
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
      options: ["error", "warning"],
    },
    disabled: { control: "boolean" },
    allowClear: { control: "boolean" },
    autoSize: { control: "boolean" },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onClear: { action: "onClear" },
  },
};
export default meta;

export const Playground: StoryObj<TextareaProps> = {
  args: {
    placeholder: "Type your message...",
    allowClear: true,
    showCount: true,
    size: "middle",
    variant: "outlined",
    status: undefined,
    disabled: false,
    maxLength: 200,
    autoSize: true,
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const variants = [
      "outlined",
      "filled",
      "borderless",
      "underlined",
    ] as const;
    const sizes = ["large", "middle", "small"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant} variant</h3>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((size) => (
                <Textarea
                  key={`${variant}-${size}`}
                  variant={variant}
                  size={size}
                  placeholder={`${variant} - ${size}`}
                  allowClear
                  showCount
                  maxLength={100}
                  autoSize
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const AutoSizeObject: StoryObj<TextareaProps> = {
  args: {
    placeholder: "Textarea with minRows and maxRows",
    autoSize: { minRows: 2, maxRows: 6 },
    allowClear: true,
    showCount: true,
  },
};

const ControlledTextareaExample = () => {
  const [value, setValue] = useState("Initial content...");

  return (
    <div className="flex flex-col gap-2 p-4">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
        placeholder="Controlled Textarea"
        allowClear
        showCount
        maxLength={150}
        autoSize
      />
      <span className="text-sm text-muted">Current value: {value}</span>
    </div>
  );
};

export const ControlledAndDefault: StoryObj = {
  render: () => <ControlledTextareaExample />,
};
