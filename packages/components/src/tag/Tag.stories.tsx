import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Info, XCircle } from "lucide-react";
import { colorArgType, variantArgType } from "../lib/storybookArgTypes";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Kısa bir etiket/durum göstergesi — bir listede kategori, durum veya nitelik belirtmek için. **Ne zaman " +
          "kullanılmaz:** Tıklanabilir bir aksiyon gerekiyorsa `Button` kullanın; Tag sadece bilgi taşır (kapatma " +
          "ikonu dışında etkileşimsizdir). Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
      },
    },
  },
  argTypes: {
    color: colorArgType,
    variant: variantArgType,
    icon: { control: false, description: "Etiketin başında gösterilecek ikon." },
    closeIcon: { control: false, description: "Özel kapatma ikonu (varsayılan: X). `onClose` verilmeden gösterilmez." },
    onClose: { description: "Verilirse bir kapatma butonu render edilir ve tıklamada çağrılır." },
    bordered: { control: "boolean", description: "Kenarlık ekler." },
  },
  args: {
    children: "Etiket",
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Playground: Story = {};

export const WithIcon: Story = {
  name: "İkonlu",
  args: { icon: <Info size={14} /> },
};

export const Closable: Story = {
  name: "Kapatılabilir",
  args: { onClose: () => {} },
};

export const CustomCloseIcon: Story = {
  name: "Özel Kapatma İkonu",
  args: { onClose: () => {}, closeIcon: <XCircle size={14} /> },
};

export const Bordered: Story = {
  name: "Kenarlıklı",
  args: { bordered: true },
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["primary", "accent", "success", "error", "warning", "info", "neutral"] as const).map((color) => (
        <Tag key={color} color={color} icon={color === "success" ? <CheckCircle size={14} /> : undefined}>
          {color}
        </Tag>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: "Tüm Varyantlar",
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["solid", "soft", "outline"] as const).map((variant) => (
        <Tag key={variant} color="primary" variant={variant}>
          {variant}
        </Tag>
      ))}
    </div>
  ),
};
