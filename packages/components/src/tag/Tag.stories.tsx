import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Info, XCircle } from "lucide-react";
import { colorArgType } from "../lib/storybookArgTypes";
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
            "Kapatma butonunun adı hangi etiketi kaldırdığını söyler (`\"React etiketini kaldır\"`; `closeLabel` ile değiştirilebilir) " +
            "ve klavyeyle (`Tab` + `Enter`) tetiklenebilir. Görünür kutu 16px, tıklama alanı 24px. Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
        }),
      },
    },
  },
  argTypes: {
    color: colorArgType,
    variant: { control: "select", options: ["solid", "soft", "outline"], description: "Dolgu stili.", table: { defaultValue: { summary: "soft" } } },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
    closeLabel: { control: "text", description: "Kapatma butonunun erişilebilir adı." },
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

const INITIAL_FILTERS = ["Elektronik", "Stokta var", "4 yıldız ve üzeri", "Ücretsiz kargo", "Apple"];

function FilterChipsDemo() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const remove = (filter: string) => setFilters((prev) => prev.filter((x) => x !== filter));
  return (
    <div className="flex max-w-md flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-mari-muted">Uygulanan filtreler:</span>
        {filters.map((f) => (
          <Tag key={f} color="primary" onClose={() => remove(f)}>
            {f}
          </Tag>
        ))}
        {filters.length === 0 && <span className="text-sm text-mari-muted">Yok</span>}
      </div>
      {filters.length < INITIAL_FILTERS.length && (
        <button type="button" className="self-start text-sm text-mari-primary underline" onClick={() => setFilters(INITIAL_FILTERS)}>
          Sıfırla
        </button>
      )}
    </div>
  );
}

export const Closable: Story = {
  name: "Kapatılabilir (filtre)",
  ...storyDoc(
    "Arama sonuçlarında uygulanan filtreler. Tag kendini gizlemez — listeyi tüketici tutar, `onClose`'da öğeyi çıkarır. " +
      "Her kapatma butonu kendi adını taşır (`\"Apple etiketini kaldır\"`).",
    `const [filters, setFilters] = useState(["Elektronik", "Stokta var", "Apple"]);

{filters.map((f) => (
  <Tag key={f} color="primary" onClose={() => setFilters((prev) => prev.filter((x) => x !== f))}>
    {f}
  </Tag>
))}`
  ),
  render: () => <FilterChipsDemo />,
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
  ...storyDoc(
    "7 renk rolü (`primary`/`accent`/`success`/`error`/`warning`/`info`/`neutral`). Renkler tema stüdyosunda çalışma zamanında değişebilir.",
    `<Tag color="primary">Yeni</Tag>
<Tag color="success" icon={<CheckCircle size={14} />}>Onaylandı</Tag>
<Tag color="error">Reddedildi</Tag>
<Tag color="neutral">Arşiv</Tag>`
  ),
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
  ...storyDoc(
    "Bir sipariş listesinde durum göstergesi — her renk farklı bir aşamayı temsil eder. Dar ekranda müşteri adı kısalır, etiket sabit kalır.",
    `<div className="flex items-center justify-between gap-3">
  <div className="min-w-0">
    <p className="font-medium">#4821</p>
    <p className="truncate text-sm text-mari-muted">Aykut Yılmaz</p>
  </div>
  <Tag color="success">Teslim Edildi</Tag>
</div>`
  ),
  render: () => (
    <div className="w-full max-w-lg divide-y divide-mari-border rounded-lg border border-mari-border">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium text-mari-foreground">{order.id}</p>
            <p className="truncate text-sm text-mari-muted">{order.customer}</p>
          </div>
          <Tag color={order.color}>{order.status}</Tag>
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: "Tüm Varyantlar",
  ...storyDoc(
    "`solid`/`soft`/`outline` — bir Tag için `ghost`/`link` uygun değil, bu yüzden `variant` sadece bu üçünü kabul eder.",
    `<Tag color="primary" variant="solid">solid</Tag>
<Tag color="primary" variant="soft">soft</Tag>
<Tag color="primary" variant="outline">outline</Tag>`
  ),
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

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-mari-foreground">
        <input type="checkbox" checked={loaded} onChange={(e) => setLoaded(e.target.checked)} />
        Veri yüklendi
      </label>
      <div className="flex flex-wrap gap-2">
        {orders.map((o) => (
          <Tag key={o.id} skeleton={!loaded} color={o.color}>
            {o.status}
          </Tag>
        ))}
      </div>
    </div>
  );
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — durum henüz gelmemişken aynı boyutta yer tutucu. Metin verilirse şeffaf olarak yerinde kalır, iskelet tam o genişlikte olur.",
    `<Tag skeleton={isLoading} color="success">Teslim Edildi</Tag>`
  ),
  render: () => <SkeletonDemo />,
};

export const LongText: Story = {
  name: "Uzun Metin",
  ...storyDoc(
    "Tag tek satırda kalır; kapsayıcıdan genişse `…` ile kısalır. Tam metni göstermek için bir `Tooltip` ile sarın.",
    `<div className="w-40">
  <Tag color="info">Uluslararası kargo ile gönderildi</Tag>
</div>`
  ),
  render: () => (
    <div className="w-40 rounded-lg border border-dashed border-mari-border p-2">
      <Tag color="info" onClose={() => {}}>
        Uluslararası kargo ile gönderildi
      </Tag>
    </div>
  ),
};

