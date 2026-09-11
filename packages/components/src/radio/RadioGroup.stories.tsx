import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { RadioGroup } from "./index";
import type { RadioGroupProps } from "./index";

const meta: Meta<typeof RadioGroup> = {
  title: "Veri Girişi/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Birden çok `Radio` seçeneğini otomatik olarak gruplayıp tek-seçim mantığını yöneten sarmalayıcı. " +
            "`useControllableState` ile hem controlled (`value`+`onChange`) hem uncontrolled (`defaultValue`) " +
            "kullanılabilir. `options` bir string/number dizisi veya `{ label, value, disabled }` nesneleri olabilir.",
          whenToUse: ["3+ birbirini dışlayan seçenek arasından tek seçim yaptırmak için — tek tek `Radio` kurmaktan daha az kod."],
          whenNotToUse: ["Çok sayıda (10+) seçenek varsa — bir `Dropdown`/`AutoComplete` daha kompakt olur."],
          a11y:
            "Kök öğe `role=\"radiogroup\"` taşır (eskiden yoktu — grup ekran okuyucuya hiç duyurulmuyordu). " +
            "Görünür bir başlık varsa `aria-labelledby`, yoksa `aria-label` verin.",
        }),
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
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    name: "meyve",
    options: ["Elma", "Portakal", "Muz"],
    defaultValue: "Portakal",
    variant: "outline",
    color: "primary",
    size: "md",
    block: false,
    disabled: false,
    "aria-label": "Meyve seçin",
  },
};

export const AllVariants: StoryObj = {
  name: "Tüm Renk × Varyant",
  ...storyDoc("2 dolgu stili × 2 renk."),
  render: () => {
    const variants = ["outline", "solid"] as const;
    const colors = ["primary", "neutral"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            {colors.map((color) => (
              <RadioGroup
                key={`${variant}-${color}`}
                name={`${variant}-${color}`}
                aria-label={`${variant} ${color} grubu`}
                options={["Seçenek 1", "Seçenek 2", "Seçenek 3"]}
                defaultValue="Seçenek 2"
                variant={variant}
                color={color}
              />
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
      <RadioGroup name="controlled" aria-label="Seçenekler" options={["Seçenek A", "Seçenek B", "Seçenek C"]} value={value} onChange={setValue} variant="solid" color="primary" />
      <span className="text-sm text-mari-muted">
        Seçili: <strong>{value}</strong>
      </span>
    </div>
  );
};

export const Controlled: StoryObj = {
  name: "Controlled Örneği",
  ...storyDoc("`value`+`onChange` ile tamamen dışarıdan yönetilir."),
  render: () => <ControlledExample />,
};
