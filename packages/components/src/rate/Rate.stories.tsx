import type { Meta, StoryObj } from "@storybook/react";
import { colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Rate } from "./Rate";

const meta: Meta<typeof Rate> = {
  title: "Components/Rate",
  component: Rate,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Yıldız tabanlı derecelendirme girişi. Yarım puan (`allowHalf`) ve tıklayarak temizleme (`allowClear`) " +
          "destekler. `useControllableState` ile hem controlled hem uncontrolled kullanılabilir. `characterColor` " +
          "ile token dışı ham bir renk zorlanabilir (ileri düzey kaçış).",
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
    characterSize: { control: "number", description: "Yıldız ikonunun piksel boyutu." },
    characterColor: { control: "color", description: "İleri düzey kaçış: `color` yerine ham bir CSS rengi zorlar." },
    onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Rate>;

export const Playground: Story = {
  args: { defaultValue: 3 },
};

export const AllowHalf: Story = {
  name: "Yarım Puan",
  args: { allowHalf: true, defaultValue: 2.5 },
};

export const AllColors: Story = {
  name: "Tüm Renkler",
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
  args: {
    defaultValue: 4.5,
    allowHalf: true,
    characterSize: 30,
    disabled: true,
  },
};

export const WithAutoFocus: Story = {
  name: "Otomatik Odak",
  args: {
    defaultValue: 2,
    autoFocus: true,
  },
};
