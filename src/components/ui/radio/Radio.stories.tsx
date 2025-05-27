import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "@/components/ui/radio";
import type { RadioProps } from "@/components/ui/radio";
import { useState } from "react";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  argTypes: {
    autoFocus: { control: "boolean" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    size: {
      control: "select",
      options: ["small", "middle", "large"],
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
    value: { control: "text" },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
};
export default meta;

export const Playground: StoryObj<RadioProps> = {
  args: {
    label: "Radio Seçeneği",
    defaultChecked: false,
    disabled: false,
    size: "middle",
    status: undefined,
    variant: "outline",
    type: "primary",
    value: "radio-1",
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
                    <Radio
                      key={`${type}-${variant}-${size}`}
                      label={`${type} - ${variant} - ${size}`}
                      type={type}
                      variant={variant}
                      size={size}
                      value={`${type}-${variant}-${size}`}
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

const ControlledExample = () => {
  const [selected, setSelected] = useState("option-a");
  return (
    <div className="flex flex-col gap-2 p-4">
      <Radio
        label="Option A"
        value="option-a"
        checked={selected === "option-a"}
        onChange={() => setSelected("option-a")}
      />
      <Radio
        label="Option B"
        value="option-b"
        checked={selected === "option-b"}
        onChange={() => setSelected("option-b")}
      />
    </div>
  );
};
export const Controlled: StoryObj = {
  render: () => <ControlledExample />,
};
