import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckboxProps } from "@/components/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    autoFocus: { control: "boolean" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    size: {
      control: "select",
      options: ["small", "middle", "large"],
    },
    shape: {
      control: "select",
      options: ["default", "round", "sharp"],
    },
    status: {
      control: "select",
      options: ["error", "warning"],
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "neutral"],
    },
    label: { control: "text" },
    description: { control: "text" },
    className: { control: "text" },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
};
export default meta;

export const Playground: StoryObj<CheckboxProps> = {
  args: {
    label: "Checkbox örneği",
    defaultChecked: false,
    disabled: false,
    indeterminate: false,
    size: "middle",
    shape: "default",
    status: undefined,
    variant: "primary",
    description: "Açıklama metni örneği",
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const variants = ["primary", "secondary", "neutral"] as const;
    const sizes = ["small", "middle", "large"] as const;

    return (
      <div className="flex flex-col gap-4 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h4 className="font-semibold capitalize">{variant} variant</h4>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((size) => (
                <Checkbox
                  key={`${variant}-${size}`}
                  label={`${variant} - ${size}`}
                  variant={variant}
                  size={size}
                  defaultChecked={size === "middle"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
