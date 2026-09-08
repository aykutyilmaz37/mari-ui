import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Textarea } from "./index";
import type { TextareaProps } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Çok satırlı metin girişi. `autoSize` ile içeriğe göre otomatik büyür (min/max satır sınırıyla). Kendi " +
          "tam tip setini tanımlar — `Input`tan miras almaz (eskiden `Omit<InputProps,...>` ile türetiliyordu ama " +
          "`onBlur`/`onFocus` tipleri `<textarea>` ile uyuşmuyordu, gerçek bir derleme hatasıydı).",
      },
    },
  },
  argTypes: {
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { ...colorArgType, description: "Odak/kenarlık rengi." },
    shape: { control: "select", options: ["default", "pill", "square"], description: "Köşe geometrisi." },
    disabled: disabledArgType,
    allowClear: { control: "boolean" },
    autoSize: { control: "boolean", description: "İçeriğe göre otomatik yükseklik — `{ minRows, maxRows }` ile sınırlandırılabilir." },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onClear: { action: "onClear" },
  },
};
export default meta;

export const Playground: StoryObj<TextareaProps> = {
  args: {
    placeholder: "Mesajınızı yazın...",
    allowClear: true,
    showCount: true,
    size: "md",
    variant: "outline",
    disabled: false,
    maxLength: 200,
    autoSize: true,
  },
};

export const AllVariants: StoryObj = {
  name: "Tüm Varyant × Boyut",
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;
    const sizes = ["lg", "md", "sm"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((size) => (
                <Textarea key={`${variant}-${size}`} variant={variant} size={size} placeholder={`${variant} - ${size}`} allowClear showCount maxLength={100} autoSize />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const AutoSizeObject: StoryObj<TextareaProps> = {
  name: "Min/Max Satır Sınırlı",
  args: {
    placeholder: "minRows ve maxRows'lu textarea",
    autoSize: { minRows: 2, maxRows: 6 },
    allowClear: true,
    showCount: true,
  },
};

const ControlledTextareaExample = () => {
  const [value, setValue] = useState("Başlangıç içeriği...");

  return (
    <div className="flex flex-col gap-2 p-4">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} onClear={() => setValue("")} placeholder="Controlled Textarea" allowClear showCount maxLength={150} autoSize />
      <span className="text-sm text-mari-muted">Güncel değer: {value}</span>
    </div>
  );
};

export const ControlledAndDefault: StoryObj = {
  name: "Controlled Örneği",
  render: () => <ControlledTextareaExample />,
};
