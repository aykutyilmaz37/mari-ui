import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Checkbox } from "./index";
import type { CheckboxProps } from "./index";

const meta: Meta<typeof Checkbox> = {
  title: "Veri Girişi/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bir açık/kapalı veya çoklu seçim durumunu temsil eden form kontrolü; `indeterminate` durumu (bazı alt " +
          "öğeler seçili) destekler. `useControllableState` ile hem controlled (`checked`+`onChange`) hem " +
          "uncontrolled (`defaultChecked`) kullanılabilir. `error`/`warning` doğrulama durumu `color` prop'unun " +
          "kendisidir (ayrı bir `status` ekseni değil — eski `status` prop'u hâlâ çalışır ama deprecated).",
      },
    },
  },
  argTypes: {
    autoFocus: { control: "boolean", description: "Mount olduğunda otomatik odaklanır." },
    checked: { control: "boolean", description: "Controlled değer." },
    defaultChecked: { control: "boolean", description: "Uncontrolled başlangıç değeri." },
    disabled: disabledArgType,
    indeterminate: { control: "boolean", description: "Belirsiz (ne tam seçili ne boş) durumu gösterir." },
    size: baseSizeArgType,
    shape: { control: "select", options: ["default", "pill", "square"], description: "Geometri." },
    color: { ...colorArgType, description: "Semantik renk. `error`/`warning` doğrulama durumu olarak da işlev görür." },
    variant: { control: "select", options: ["outline", "solid"], description: "Dolgu stili." },
    label: { control: "text", description: "Kutucuğun yanındaki etiket." },
    description: { control: "text", description: "Etiketin altında gösterilecek yardımcı metin." },
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
    size: "md",
    shape: "default",
    color: "primary",
    variant: "outline",
    description: "Açıklama metni örneği",
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
                    <Checkbox key={`${color}-${variant}-${size}`} label={`${color} · ${variant} · ${size}`} color={color} variant={variant} size={size} defaultChecked={size === "md"} />
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
  const options = ["Seçenek A", "Seçenek B", "Seçenek C"];
  const [checkedItems, setCheckedItems] = useState<string[]>(["Seçenek A"]);

  const allChecked = checkedItems.length === options.length;
  const isIndeterminate = checkedItems.length > 0 && checkedItems.length < options.length;

  const toggleItem = (value: string) => {
    setCheckedItems((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <Checkbox label="Tümünü Seç" indeterminate={isIndeterminate} checked={allChecked} onChange={(e) => setCheckedItems(e.target.checked ? [...options] : [])} />
      {options.map((option) => (
        <Checkbox key={option} label={option} checked={checkedItems.includes(option)} onChange={() => toggleItem(option)} />
      ))}
    </div>
  );
};

export const IndeterminateCheckbox: StoryObj = {
  name: "Belirsiz (Indeterminate) Örneği",
  render: () => <IndeterminateExample />,
};
