import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Radio } from "./index";
import type { RadioProps } from "./index";

const meta: Meta<typeof Radio> = {
  title: "Veri Girişi/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bir grup seçenekten TEK birini seçmek için kullanılır — genelde `RadioGroup` içinde, ama tek başına da " +
          "kullanılabilir. `useControllableState` ile controlled/uncontrolled ikisini de destekler. Aynı `name` " +
          "değerini paylaşan Radio'lar bir grup oluşturur (native `<input type=\"radio\">` davranışı).",
      },
    },
  },
  argTypes: {
    autoFocus: { control: "boolean", description: "Mount olduğunda otomatik odaklanır." },
    checked: { control: "boolean", description: "Controlled değer." },
    defaultChecked: { control: "boolean", description: "Uncontrolled başlangıç değeri." },
    disabled: disabledArgType,
    size: baseSizeArgType,
    color: { ...colorArgType, description: "Semantik renk. `error`/`warning` doğrulama durumu olarak da işlev görür." },
    variant: { control: "select", options: ["outline", "solid"], description: "Dolgu stili." },
    label: { control: "text", description: "Yanındaki etiket." },
    value: { control: "text", description: "Bu seçeneğin değeri." },
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
    size: "md",
    color: "primary",
    variant: "outline",
    value: "radio-1",
  },
};

export const AllVariants: StoryObj = {
  name: "Tüm Renk × Varyant × Boyut",
  render: () => {
    const colors = ["primary", "neutral", "error", "warning"] as const;
    const variants = ["outline", "solid"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {colors.map((color) => (
          <div key={color} className="space-y-4">
            <h3 className="font-semibold capitalize">{color}</h3>
            {variants.map((variant) => (
              <div key={variant} className="space-y-2">
                <h4 className="capitalize text-sm text-mari-muted">{variant}</h4>
                <div className="flex gap-4 flex-wrap">
                  {sizes.map((size) => (
                    <Radio key={`${color}-${variant}-${size}`} label={`${color} · ${variant} · ${size}`} color={color} variant={variant} size={size} value={`${color}-${variant}-${size}`} defaultChecked={size === "md"} />
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
  const [selected, setSelected] = useState("secenek-a");
  return (
    <div className="flex flex-col gap-2 p-4">
      <Radio label="Seçenek A" value="secenek-a" checked={selected === "secenek-a"} onChange={() => setSelected("secenek-a")} />
      <Radio label="Seçenek B" value="secenek-b" checked={selected === "secenek-b"} onChange={() => setSelected("secenek-b")} />
    </div>
  );
};
export const Controlled: StoryObj = {
  name: "Controlled Örneği",
  render: () => <ControlledExample />,
};
