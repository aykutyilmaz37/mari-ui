import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Textarea } from "./index";
import type { TextareaProps } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "Veri Girişi/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Çok satırlı metin girişi. `autoSize` ile içeriğe göre otomatik büyür (min/max satır sınırıyla). Kendi " +
            "tam tip setini tanımlar — `Input`tan miras almaz.",
          whenToUse: ["Yorum, açıklama, mesaj gibi birden fazla satır gerektiren serbest metin için."],
          whenNotToUse: ["Tek satırlık girişler için — `Input`, gereksiz yükseklik kaplamaz."],
          a11y: "`name`/`required`/`aria-label`/`aria-labelledby` desteklenir. `color=\"error\"` iken otomatik `aria-invalid=\"true\"` eklenir.",
        }),
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
  ...storyDoc("Tüm props'ları canlı deneyin."),
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
  ...storyDoc("4 kenarlık/arka plan stili × 3 boyut. Yükseklik `autoSize` ile içeriğe göre büyür, sabit değil."),
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
  ...storyDoc("`autoSize={{ minRows, maxRows }}` — belirli bir aralıkta büyür, sonra kayar."),
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
  ...storyDoc("`value`+`onChange` ile tamamen dışarıdan yönetilir."),
  render: () => <ControlledTextareaExample />,
};
