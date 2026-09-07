import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckboxProps } from "@/components/ui/checkbox";
import { useState } from "react";

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
      options: ["outline", "solid"],
    },
    type: {
      control: "select",
      options: ["primary", "secondary"],
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

export const Playground: StoryObj<CheckboxProps & { type: string }> = {
  args: {
    label: "Checkbox örneği",
    defaultChecked: false,
    disabled: false,
    indeterminate: false,
    size: "middle",
    shape: "default",
    status: undefined,
    variant: "outline",
    type: "primary",
    description: "Açıklama metni örneği",
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const types = ["primary", "secondary"] as const;
    const variants = ["outline", "solid"] as const;
    const sizes = ["small", "middle", "large"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {types.map((type) => (
          <div key={type} className="space-y-4">
            <h3 className="font-semibold capitalize">{type} type</h3>
            {variants.map((variant) => (
              <div key={variant} className="space-y-2">
                <h4 className="capitalize">{variant} variant</h4>
                <div className="flex gap-4 flex-wrap">
                  {sizes.map((size) => (
                    <Checkbox
                      key={`${type}-${variant}-${size}`}
                      label={`${type} - ${variant} - ${size}`}
                      type={type}
                      variant={variant}
                      size={size}
                      defaultChecked={size === "middle"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

const IndeterminateExample = () => {
  const options = ["Option A", "Option B", "Option C"];
  const [checkedItems, setCheckedItems] = useState<string[]>(["Option A"]);

  const allChecked = checkedItems.length === options.length;
  const isIndeterminate =
    checkedItems.length > 0 && checkedItems.length < options.length;

  const toggleItem = (value: string) => {
    setCheckedItems((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <Checkbox
        label="Select All"
        indeterminate={isIndeterminate}
        checked={allChecked}
        onChange={(e) => setCheckedItems(e.target.checked ? [...options] : [])}
        type="primary"
        variant="outline"
      />
      {options.map((option) => (
        <Checkbox
          key={option}
          label={option}
          checked={checkedItems.includes(option)}
          onChange={() => toggleItem(option)}
          type="primary"
          variant="outline"
        />
      ))}
    </div>
  );
};

export const IndeterminateCheckbox: StoryObj = {
  render: () => <IndeterminateExample />,
};
