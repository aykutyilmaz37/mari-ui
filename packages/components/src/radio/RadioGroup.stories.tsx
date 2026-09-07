// RadioGroup.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup } from "./index";
import type { RadioGroupProps } from "./index";
import { useState } from "react";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outline", "solid"],
    },
    type: {
      control: "select",
      options: ["primary", "secondary"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
    className: { control: "text" },
    onChange: { action: "onChange" },
  },
};

export default meta;

export const Playground: StoryObj<RadioGroupProps> = {
  args: {
    name: "fruit",
    options: ["Apple", "Orange", "Banana"],
    defaultValue: "Orange",
    variant: "outline",
    type: "primary",
    size: "md",
    block: false,
    disabled: false,
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const variants = ["outline", "solid"] as const;
    const types = ["primary", "secondary"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant} variant</h3>
            {types.map((type) => (
              <div key={type} className="space-y-2">
                <p className="capitalize">{type} type</p>
                <div className="flex gap-4 flex-wrap">
                  {sizes.map((size) => (
                    <RadioGroup
                      key={`${variant}-${type}-${size}`}
                      name={`${variant}-${type}-${size}`}
                      options={["Option 1", "Option 2", "Option 3"]}
                      defaultValue="Option 2"
                      variant={variant}
                      type={type}
                      size={size}
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

const ControlledExample = () => {
  const [value, setValue] = useState<string | number>("Option A");

  return (
    <div className="flex flex-col gap-4 p-4">
      <RadioGroup
        name="controlled"
        options={["Option A", "Option B", "Option C"]}
        value={value}
        onChange={setValue}
        variant="solid"
        type="primary"
      />
      <span className="text-sm text-muted">
        Selected: <strong>{value}</strong>
      </span>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledExample />,
};
