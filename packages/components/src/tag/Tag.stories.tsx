import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Info, XCircle } from "lucide-react";
import { colorArgType, variantArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Veri Gösterimi/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Kısa bir etiket/durum göstergesi — bir listede kategori, durum veya nitelik belirtmek için. Şekli " +
            "ant.design'ın gerçek Tag'iyle (`getComputedStyle`) birebir hizalı: hap (pill) değil, 4px yuvarlatılmış " +
            "küçük bir dikdörtgen.",
          whenToUse: ["Bir öğeye kısa, taranabilir bir kategori/durum/nitelik etiketi eklerken."],
          whenNotToUse: ["Tıklanabilir bir aksiyon gerekiyorsa `Button` kullanın; Tag sadece bilgi taşır (kapatma ikonu dışında etkileşimsizdir)."],
          a11y:
            "Kapatma butonu `aria-label=\"Kaldır\"` taşır ve klavyeyle (`Tab` + `Enter`) tetiklenebilir. Hook kullanmaz, " +
            "sunucu bileşeni olarak render edilebilir.",
        }),
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

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
};

export const WithIcon: Story = {
  name: "İkonlu",
  ...storyDoc("`icon`, etiket metninin önünde gösterilir."),
  args: { icon: <Info size={14} /> },
};

export const Closable: Story = {
  name: "Kapatılabilir",
  ...storyDoc("`onClose` verilince bir kapatma butonu render edilir — `aria-label=\"Kaldır\"` taşır ve klavyeyle tetiklenebilir."),
  args: { onClose: () => {} },
};

export const CustomCloseIcon: Story = {
  name: "Özel Kapatma İkonu",
  ...storyDoc("`closeIcon` ile varsayılan X yerine özel bir ikon verilebilir."),
  args: { onClose: () => {}, closeIcon: <XCircle size={14} /> },
};

export const Bordered: Story = {
  name: "Kenarlıklı",
  ...storyDoc("`bordered`, `outline` varyantı dışındaki tüm varyantlara ince bir kenarlık ekler."),
  args: { bordered: true },
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  ...storyDoc("7 renk rolü (`primary`/`accent`/`success`/`error`/`warning`/`info`/`neutral`). Renkler tema stüdyosunda çalışma zamanında değişebilir."),
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

const orders = [
  { id: "#4821", customer: "Aykut Yılmaz", status: "Teslim Edildi", color: "success" },
  { id: "#4822", customer: "Deniz Kaya", status: "Kargoda", color: "info" },
  { id: "#4823", customer: "Elif Şahin", status: "Hazırlanıyor", color: "warning" },
  { id: "#4824", customer: "Mert Demir", status: "İptal Edildi", color: "error" },
] as const;

export const OrderList: Story = {
  name: "Sipariş Listesi",
  ...storyDoc("Bir sipariş listesinde durum göstergesi — her renk farklı bir aşamayı temsil eder."),
  render: () => (
    <div className="w-full max-w-lg divide-y divide-mari-border rounded-lg border border-mari-border">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium text-mari-foreground">{order.id}</p>
            <p className="text-sm text-mari-muted">{order.customer}</p>
          </div>
          <Tag color={order.color}>{order.status}</Tag>
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: "Tüm Varyantlar",
  ...storyDoc("`solid`/`soft`/`outline` — bir Tag için `ghost`/`link` uygun değil, bu yüzden `variant` sadece bu üçünü kabul eder."),
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
