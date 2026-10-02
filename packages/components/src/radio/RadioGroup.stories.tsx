import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
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
            "Kök öğe `role=\"radiogroup\"` taşır. `name` verilmezse otomatik ortak bir ad atanır — radyolar tarayıcı gözünde tek grup olur: " +
            "Tab gruba bir kez girer, **Ok tuşları** seçenekler arasında gezer. Görünür bir başlık varsa `aria-labelledby`, yoksa `aria-label` verin. " +
            "Seçenek `description`'ı `aria-describedby` ile bağlıdır.",
        }),
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["outline", "solid"], description: "Dolgu stili." },
    color: { ...colorArgType, description: "Semantik renk." },
    size: baseSizeArgType,
    block: { control: "boolean", description: "Seçenekleri tam genişlikte, sarmalanmadan dizer." },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"], description: "Yerleşim. Açıklamalı seçeneklerde `vertical`.", table: { defaultValue: { summary: "horizontal" } } },
    skeleton: { control: "boolean", description: "Seçenekler yerine yer tutucular (grup `aria-busy`).", table: { defaultValue: { summary: "false" } } },
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
    orientation: "horizontal",
    disabled: false,
    skeleton: false,
    "aria-label": "Meyve seçin",
  },
};

export const Controlled: StoryObj = {
  name: "Teslimat Seçimi (dikey, açıklamalı)",
  ...storyDoc(
    "`value`+`onChange` ile dışarıdan yönetilir; `orientation=\"vertical\"` ve seçenek `description`'ı ile ödeme/teslimat adımı. Bir seçeneğe odaklanıp Ok tuşlarını deneyin.",
    `<RadioGroup
  aria-labelledby="kargo-baslik"
  orientation="vertical"
  value={value}
  onChange={setValue}
  options={[
    { value: "standart", label: "Standart kargo", description: "3–5 iş günü · Ücretsiz" },
    { value: "hizli", label: "Hızlı kargo", description: "Yarın kapında · 49,90 ₺" },
  ]}
/>`
  ),
  render: () => <ControlledExample />,
};

export const AllVariants: StoryObj = {
  name: "Tüm Renk × Varyant",
  ...storyDoc(
    "2 dolgu stili × 2 renk.",
    `<RadioGroup aria-label="Plan" options={["Aylık", "Yıllık"]} defaultValue="Yıllık" variant="solid" />`
  ),
  render: () => {
    const variants = ["outline", "solid"] as const;
    const colors = ["primary", "neutral"] as const;

    return (
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            {colors.map((color) => (
              <RadioGroup
                key={`${variant}-${color}`}
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
  const [value, setValue] = useState<string | number>("standart");
  const fee = { standart: "Ücretsiz", hizli: "49,90 ₺", ayni: "89,90 ₺" }[value as "standart" | "hizli" | "ayni"];

  return (
    <div className="flex max-w-md flex-col gap-3">
      <span id="kargo-baslik" className="text-sm font-medium text-mari-foreground">
        Teslimat seçeneği
      </span>
      <RadioGroup
        aria-labelledby="kargo-baslik"
        orientation="vertical"
        value={value}
        onChange={setValue}
        options={[
          { value: "standart", label: "Standart kargo", description: "3–5 iş günü · Ücretsiz" },
          { value: "hizli", label: "Hızlı kargo", description: "Yarın kapında · 49,90 ₺" },
          { value: "ayni", label: "Aynı gün teslimat", description: "Sadece İstanbul, saat 14.00'e kadar · 89,90 ₺", disabled: false },
        ]}
      />
      <span className="text-sm text-mari-muted" aria-live="polite">
        Kargo ücreti: <strong className="text-mari-foreground">{fee}</strong>
      </span>
    </div>
  );
};

export const Skeleton: StoryObj = {
  name: "İskelet",
  ...storyDoc("`skeleton` — seçenekler gelene kadar radyo + etiket genişliğinde yer tutucular; grup `aria-busy`.", `<RadioGroup aria-label="Beden" options={sizes} skeleton={isLoading} />`),
  render: () => <SkeletonDemo>{(skeleton) => <RadioGroup aria-label="Beden" skeleton={skeleton} options={["S", "M", "L", "XL"]} />}</SkeletonDemo>,
};

