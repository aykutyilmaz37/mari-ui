import type { Meta, StoryObj } from "@storybook/react";
import { colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Rate } from "./Rate";

const meta: Meta<typeof Rate> = {
  title: "Veri Girişi/Rate",
  component: Rate,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Yıldız tabanlı derecelendirme girişi. Yarım puan (`allowHalf`) ve tıklayarak temizleme (`allowClear`) " +
            "destekler. `useControllableState` ile hem controlled hem uncontrolled kullanılabilir. `characterColor` " +
            "ile token dışı ham bir renk zorlanabilir (ileri düzey kaçış).",
          whenToUse: ["Kullanıcıdan bir memnuniyet/kalite puanı almak için."],
          whenNotToUse: ["Kesin bir sayısal değer gerekiyorsa — `Slider` veya `Input type=\"number\"`."],
          a11y:
            "Tek bir odak durağı — `role=\"slider\"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext` " +
            "taşır. **Ok Sağ/Yukarı** artırır, **Ok Sol/Aşağı** azaltır, **Home**/**End** uçlara atlar (eskiden " +
            "dahili hiçbir tuş desteği yoktu — fare olmadan kullanılamazdı).",
        }),
      },
    },
  },
  argTypes: {
    value: { control: "number", description: "Controlled değer." },
    defaultValue: { control: "number", description: "Uncontrolled başlangıç değeri." },
    count: { control: "number", description: "Toplam yıldız sayısı. Varsayılan: 5." },
    allowHalf: { control: "boolean", description: "Yarım puan seçimine izin verir." },
    allowClear: { control: "boolean", description: "Mevcut değere tekrar tıklanınca sıfırlar." },
    disabled: disabledArgType,
    color: { ...colorArgType, description: "Yıldızların rengi. Varsayılan: `warning` (amber)." },
    characterSize: { control: "text", description: "Yıldız ikonunun boyutu — varsayılan `\"1.5rem\"`. Sayı verilirse `px`." },
    characterColor: { control: "color", description: "İleri düzey kaçış: `color` yerine ham bir CSS rengi zorlar." },
    onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Rate>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin. Odaklanıp Ok tuşlarını da deneyin."),
  args: { defaultValue: 3 },
};

export const AllowHalf: Story = {
  name: "Yarım Puan",
  ...storyDoc("`allowHalf` — yarım yıldız hassasiyetiyle puanlama; klavyede adım da yarımşar ilerler."),
  args: { allowHalf: true, defaultValue: 2.5 },
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  ...storyDoc("7 renk rolünün tamamı."),
  render: () => (
    <div className="flex flex-col gap-3">
      {(["warning", "primary", "accent", "success", "error", "info", "neutral"] as const).map((color) => (
        <Rate key={color} color={color} defaultValue={3} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  name: "Devre Dışı",
  ...storyDoc("`disabled` — ne fare ne klavye ile değişir."),
  args: {
    defaultValue: 4.5,
    allowHalf: true,
    characterSize: "2rem",
    disabled: true,
  },
};

export const WithAutoFocus: Story = {
  name: "Otomatik Odak",
  ...storyDoc("`autoFocus` — mount olduğunda doğrudan klavye ile puanlamaya hazır."),
  args: {
    defaultValue: 2,
    autoFocus: true,
  },
};
