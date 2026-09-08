import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Sparkles } from "lucide-react";
import { colorArgType, disabledArgType, sizeArgType, variantArgType } from "../lib/storybookArgTypes";
import { Button } from "./Button";
import type { ButtonProps } from "./types";

const meta: Meta<ButtonProps & { showIcon?: boolean }> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bir aksiyonu tetiklemek için temel etkileşim öğesi. `href` verilirse `<a>`, verilmezse `<button>` render " +
          "eder — link ve buton davranışını tek bir API'de birleştirir. Hook kullanmaz, sunucu bileşeni olarak " +
          "render edilebilir (`onClick` verildiğinde React etkileşimi otomatik olarak client boundary'sine taşır). " +
          "**Erişilebilirlik:** `aria-label` gibi native attribute'ları destekler — sadece ikon içeren butonlarda " +
          "mutlaka bir `aria-label` verin.",
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Buton etiketi." },
    color: colorArgType,
    variant: variantArgType,
    size: sizeArgType,
    shape: { control: "select", options: ["default", "pill", "circle", "square"], description: "Geometri — `circle` ikon-only butonlar içindir." },
    showIcon: { control: "boolean", description: "(Sadece bu story'de) örnek bir ikon gösterir/gizler." },
    icon: { control: false, description: "Etiketle birlikte gösterilecek ikon." },
    iconPosition: { control: "select", options: ["start", "end"], description: "İkonun etikete göre konumu." },
    loading: { control: "boolean", description: "Yükleniyor durumu — `true` veya `{ icon, iconPosition }` şeklinde özelleştirilebilir." },
    block: { control: "boolean", description: "Tam genişlik kaplar." },
    disabled: disabledArgType,
    href: { control: "text", description: "Verilirse `<a>` olarak render edilir." },
  },
};
export default meta;

type Story = StoryObj<ButtonProps & { showIcon?: boolean }>;

export const Playground: Story = {
  args: {
    children: "Buton",
    color: "primary",
    variant: "solid",
    size: "md",
    shape: "default",
    iconPosition: "start",
    showIcon: false,
    loading: false,
    block: false,
    disabled: false,
  },
  render: (args) => {
    const { showIcon, ...rest } = args;
    return (
      <Button {...rest} icon={showIcon ? <Sparkles className="w-4 h-4" /> : undefined} loading={args.loading ? { icon: <Loader2 className="w-4 h-4 animate-spin" />, iconPosition: "start" } : false} />
    );
  },
};

export const AllVariants: Story = {
  name: "Tüm Renk × Varyant Kombinasyonları",
  render: () => {
    const colors = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
    const variants = ["solid", "outline", "soft", "ghost", "link"] as const;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {colors.map((color) =>
          variants.map((variant) => (
            <Button key={`${color}-${variant}`} color={color} variant={variant}>
              {color} {variant}
            </Button>
          ))
        )}
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "Boyutlar",
  render: () => (
    <div className="flex items-center gap-3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const States: Story = {
  name: "Durumlar",
  render: () => (
    <div className="flex items-center gap-3">
      <Button>Normal</Button>
      <Button disabled>Devre dışı</Button>
      <Button loading>Yükleniyor</Button>
      <Button icon={<Sparkles className="w-4 h-4" />}>İkonlu</Button>
    </div>
  ),
};

export const Shapes: Story = {
  name: "Şekiller",
  render: () => (
    <div className="flex items-center gap-3">
      <Button shape="default">Varsayılan</Button>
      <Button shape="pill">Hap</Button>
      <Button shape="square">Kare</Button>
      <Button shape="circle" icon={<Sparkles className="w-4 h-4" />} aria-label="Yıldız" />
    </div>
  ),
};

export const AsLink: Story = {
  name: "Link Olarak",
  args: { href: "https://example.com", target: "_blank", children: "Dış Bağlantı" },
};
