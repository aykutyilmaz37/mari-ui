import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import type { InputProps } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, PhoneIcon, Search, XIcon } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
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
      options: ["error", "warning"],
    },
    mask: { control: "text" },
    replacement: {
      control: "object",
    },
    disabled: { control: "boolean" },
    allowClear: { control: "boolean" },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onClear: { action: "onClear" },
    visibilityToggle: {
      control: "boolean",
    },
    visibilityIconRender: {
      control: false,
    },
  },
};
export default meta;

export const Playground: StoryObj<InputProps & { enableMask: boolean }> = {
  render: (args) => {
    const { enableMask, mask, replacement, visibilityToggle, type, ...rest } =
      args as InputProps & { enableMask?: boolean };

    const resolvedType =
      visibilityToggle === true
        ? "password"
        : type === "password"
        ? "text"
        : type;

    return (
      <Input
        {...rest}
        type={resolvedType}
        {...(enableMask ? { mask, replacement } : {})}
        visibilityToggle={visibilityToggle}
      />
    );
  },
  argTypes: {
    enableMask: { control: "boolean" },
  },
  args: {
    placeholder: "Type something...",
    allowClear: false,
    showCount: false,
    size: "middle",
    variant: "outlined",
    maxLength: 100,
    enableMask: false,
    mask: "0(5__) ___ __ __",
    replacement: { _: /\d/ },
    type: "text", // Başlangıç olarak text
    visibilityToggle: false,
    visibilityIconRender: (visible: boolean) =>
      visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />,
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
                <Input
                  key={`${variant}-${size}`}
                  size={size}
                  variant={variant}
                  placeholder={`${variant} - ${size}`}
                  icon={<Search size={16} />}
                  allowClear={{
                    clearIcon: <XIcon size={16} />,
                  }}
                  showCount
                  maxLength={30}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const ErrorStatus: StoryObj<InputProps> = {
  args: {
    placeholder: "Error state...",
    status: "error",
    icon: <Search size={16} />,
    allowClear: true,
  },
};

export const WarningStatus: StoryObj<InputProps> = {
  args: {
    placeholder: "Warning state...",
    status: "warning",
    icon: <Search className="w-4 h-4 text-muted" />,
    allowClear: true,
  },
};

export const PressEnterAction: StoryObj<InputProps> = {
  args: {
    placeholder: "Press Enter to trigger action",
    onPressEnter: () => alert("Enter pressed!"),
  },
};

export const CustomCountFormatter: StoryObj<InputProps> = {
  args: {
    placeholder: "Custom count formatter",
    maxLength: 50,
    showCount: true,
    count: {
      formatter: ({ count, maxLength }) => `${maxLength! - count} chars left`,
    },
  },
};

const ControlledInputExample = () => {
  const [value, setValue] = useState("Initial value");

  return (
    <div className="flex flex-col gap-2 p-4">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
        allowClear={{ clearIcon: <XIcon size={16} /> }}
        placeholder="Controlled + Default"
      />
      <span className="text-sm text-muted">Current value: {value}</span>
    </div>
  );
};

export const ControlledAndDefault: StoryObj = {
  render: () => <ControlledInputExample />,
};

export const MaskedInput: StoryObj<InputProps> = {
  args: {
    placeholder: "0(5__) ___ __ __",
    mask: "0(5__) ___ __ __",
    replacement: { _: /\d/ },
    icon: <PhoneIcon size={16} />,
    allowClear: {
      clearIcon: <XIcon size={16} />,
    },
    showCount: true,
    size: "middle",
    variant: "outlined",
    maxLength: 16,
  },
};
