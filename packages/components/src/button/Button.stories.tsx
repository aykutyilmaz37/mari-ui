import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Sparkles } from "lucide-react";
import { colorArgType, disabledArgType, sizeArgType, variantArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Button } from "./Button";
import type { ButtonProps } from "./types";

const meta: Meta<ButtonProps & { showIcon?: boolean }> = {
  title: "Genel/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir aksiyonu tetiklemek için temel etkileşim öğesi. `href` verilirse `<a>`, verilmezse `<button>` render eder — " +
            "link ve buton davranışını tek bir API'de birleştirir. Hook kullanmaz, sunucu bileşeni olarak render edilebilir " +
            "(`onClick` verildiğinde React etkileşimi otomatik olarak client boundary'sine taşır).",
          whenToUse: [
            "Bir formu göndermek, bir diyalog açmak veya bir işlemi başlatmak gibi tekil bir aksiyon için.",
            "Bir sayfadaki birincil eylemi (`variant=\"solid\"`) ve ona eşlik eden ikincil eylemleri (`outline`/`soft`/`ghost`) ayırmak için.",
            "Başka bir sayfaya götüren ama buton gibi görünmesi gereken bir bağlantı için (`href`).",
          ],
          whenNotToUse: [
            "Sırf metin içi gezinme bağlantısı için — düz bir `<a>` yeterli.",
            "Aç/kapa durumu için — `Switch` veya `Checkbox` kullanın.",
          ],
          a11y:
            "`aria-label` dahil tüm native attribute'ları geçirir — **sadece ikon içeren** butonlarda mutlaka `aria-label` verin. " +
            "Odak halkası `focus-visible` ile `--mari-color-ring` renginde çizilir. `disabled` iken `pointer-events` kapatılır.",
        }),
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Buton etiketi." },
    color: colorArgType,
    variant: variantArgType,
    size: sizeArgType,
    shape: { control: "select", options: ["default", "pill", "circle", "square"], description: "Geometri — `circle` ikon-only butonlar içindir.", table: { defaultValue: { summary: "default" } } },
    showIcon: { control: "boolean", description: "(Sadece bu story'de) örnek bir ikon gösterir/gizler." },
    icon: { control: false, description: "Etiketle birlikte gösterilecek ikon." },
    iconPosition: { control: "select", options: ["start", "end"], description: "İkonun etikete göre konumu.", table: { defaultValue: { summary: "start" } } },
    loading: { control: "boolean", description: "Yükleniyor durumu — `true` veya `{ icon, iconPosition }` şeklinde özelleştirilebilir." },
    block: { control: "boolean", description: "Tam genişlik kaplar." },
    disabled: disabledArgType,
    href: { control: "text", description: "Verilirse `<a>` olarak render edilir." },
  },
};
export default meta;

type Story = StoryObj<ButtonProps & { showIcon?: boolean }>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin. Diğer örnekler tekil senaryoları sabitler."),
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
  ...storyDoc("7 renk rolü (`primary`/`accent`/`success`/`error`/`warning`/`info`/`neutral`) × 5 varyant. Renkler tema stüdyosunda çalışma zamanında değişebilir."),
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
  ...storyDoc("`xs`–`xl` paylaşılan boyut ölçeğinden (`lib/sizeClasses`) — yükseklik/padding/font-size `@mari-ui/core`'un `componentSize` tablosuyla sayısal hizalı."),
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
  ...storyDoc("Normal, `disabled`, `loading` ve ikonlu. `loading` sırasında ikon yerini yükleme göstergesi alır."),
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
  ...storyDoc("`default` / `pill` / `square` / `circle`. `circle` yatay padding'i sıfırlar ve kare en-boy oranı uygular — ikon-only butonlar içindir."),
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
  ...storyDoc("`href` verilince `<a>` render edilir; görünüm aynı kalır, `disabled` iken tekrar `<button>`'a düşer."),
  args: { href: "https://example.com", target: "_blank", children: "Dış Bağlantı" },
};
