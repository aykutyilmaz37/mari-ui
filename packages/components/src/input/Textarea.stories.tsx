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
    autoSize: { control: "boolean", description: "İçeriğe göre otomatik yükseklik — `{ minRows, maxRows }` ile sınırlandırılabilir (sınır aşılınca kayar)." },
    rows: { control: "number", description: "Başlangıç yüksekliği (satır). `autoSize` yoksa elle dikey büyütülebilir.", table: { defaultValue: { summary: "3" } } },
    skeleton: { control: "boolean", description: "Veri yokken aynı yükseklikte iskelet.", table: { defaultValue: { summary: "false" } } },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onClear: { action: "onClear" },
  },
};
export default meta;

export const Playground: StoryObj<TextareaProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    "aria-label": "Mesaj",
    placeholder: "Mesajınızı yazın...",
    allowClear: true,
    showCount: true,
    size: "md",
    variant: "outline",
    disabled: false,
    maxLength: 200,
    rows: 3,
    skeleton: false,
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
};

export const AllVariants: StoryObj = {
  name: "Tüm Varyant × Boyut",
  ...storyDoc(
    "4 kenarlık/arka plan stili × 3 boyut.",
    `<Textarea variant="outline" aria-label="Not" rows={3} />
<Textarea variant="soft" aria-label="Not" rows={3} />
<Textarea variant="ghost" aria-label="Not" rows={3} />
<Textarea variant="underlined" aria-label="Not" rows={3} />`
  ),
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;
    const sizes = ["lg", "md", "sm"] as const;

    return (
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="text-sm font-semibold text-mari-foreground">{variant}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {sizes.map((size) => (
                <Textarea key={`${variant}-${size}`} aria-label={`${variant} ${size}`} variant={variant} size={size} placeholder={`Sipariş notu (${size})`} rows={2} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const AutoSizeObject: StoryObj<TextareaProps> = {
  name: "Mesaj Kutusu (min/max satır)",
  ...storyDoc(
    "Sohbet kutusu gibi: 1 satırdan başlar, yazdıkça 5 satıra kadar büyür, sonra kendi içinde kayar — sayfayı itmez. Birkaç satır yazıp deneyin.",
    `<Textarea aria-label="Mesaj" autoSize={{ minRows: 1, maxRows: 5 }} />`
  ),
  args: {
    "aria-label": "Mesaj",
    placeholder: "Bir mesaj yazın…",
    autoSize: { minRows: 1, maxRows: 5 },
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
};

function ReviewDemo() {
  const [value, setValue] = useState("Kargo hızlıydı, ürün açıklamadaki gibi. Kutusu biraz ezik geldi ama ürüne zarar yoktu.");
  return (
    <div className="flex max-w-md flex-col gap-1.5">
      <label htmlFor="review" className="text-sm font-medium text-mari-foreground">
        Değerlendirmeniz
      </label>
      <Textarea id="review" value={value} onChange={(e) => setValue(e.target.value)} onClear={() => setValue("")} allowClear showCount maxLength={150} rows={4} />
    </div>
  );
}

export const ControlledAndDefault: StoryObj = {
  name: "Ürün Değerlendirmesi (sayaçlı)",
  ...storyDoc(
    "`value`+`onChange` ile dışarıdan yönetilir. Sayaç `maxLength`'e ulaşınca hata rengine döner. `autoSize` olmadığı için sağ alt köşeden dikey büyütülebilir.",
    `<label htmlFor="review">Değerlendirmeniz</label>
<Textarea id="review" value={value} onChange={(e) => setValue(e.target.value)} showCount maxLength={150} rows={4} />`
  ),
  render: () => <ReviewDemo />,
};

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex max-w-md flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-mari-foreground">
        <input type="checkbox" checked={loaded} onChange={(e) => setLoaded(e.target.checked)} />
        Veri yüklendi
      </label>
      <Textarea aria-label="Ürün açıklaması" skeleton={!loaded} rows={4} defaultValue="Kablosuz, gürültü önleyici kulak üstü kulaklık. 30 saat pil ömrü." />
    </div>
  );
}

export const Skeleton: StoryObj = {
  name: "İskelet",
  ...storyDoc("`skeleton` — `rows` kadar gerçek yükseklikte yer tutucu; yüklenince blok zıplamaz.", `<Textarea skeleton={isLoading} rows={4} defaultValue={product.description} />`),
  render: () => <SkeletonDemo />,
};
