import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { RadioGroup } from "./index";
import type { RadioGroupProps } from "./index";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Birden çok `Radio` seçeneğini otomatik olarak gruplayıp tek-seçim mantığını yöneten sarmalayıcı. " +
          "`useControllableState` ile hem controlled (`value`+`onChange`) hem uncontrolled (`defaultValue`) " +
          "kullanılabilir. `options` bir string/number dizisi veya `{ label, value, disabled }` nesneleri olabilir.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["outline", "solid"], description: "Dolgu stili." },
    color: { ...colorArgType, description: "Semantik renk." },
    size: baseSizeArgType,
    block: { control: "boolean", description: "Seçenekleri tam genişlikte, sarmalanmadan dizer." },
    disabled: disabledArgType,
    className: { control: "text" },
    onChange: { action: "onChange" },
  },
};

export default meta;

export const Playground: StoryObj<RadioGroupProps> = {
  args: {
    name: "meyve",
    options: ["Elma", "Portakal", "Muz"],
    defaultValue: "Portakal",
    variant: "outline",
    color: "primary",
    size: "md",
    block: false,
    disabled: false,
  },
};

export const AllVariants: StoryObj = {
  name: "Tüm Renk × Varyant",
  render: () => {
    const variants = ["outline", "solid"] as const;
    const colors = ["primary", "neutral"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            {colors.map((color) => (
              <RadioGroup key={`${variant}-${color}`} name={`${variant}-${color}`} options={["Seçenek 1", "Seçenek 2", "Seçenek 3"]} defaultValue="Seçenek 2" variant={variant} color={color} />
            ))}
          </div>
        ))}
      </div>
    );
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState<string | number>("Seçenek A");

  return (
    <div className="flex flex-col gap-4 p-4">
      <RadioGroup name="controlled" options={["Seçenek A", "Seçenek B", "Seçenek C"]} value={value} onChange={setValue} variant="solid" color="primary" />
      <span className="text-sm text-mari-muted">
        Seçili: <strong>{value}</strong>
      </span>
    </div>
  );
};

export const Controlled: StoryObj = {
  name: "Controlled Örneği",
  render: () => <ControlledExample />,
};
