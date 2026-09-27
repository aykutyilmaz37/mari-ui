import { useState } from "react";
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
  name: "Renkler",
  ...storyDoc(
    "`color` verilmezse (önerilen) yıldız puan token'larıyla çizilir: parlak sarı dolgu + koyu altın kontur — sarı tek başına beyaz zeminde 3:1 veremediği için kontur erişilebilirliği sağlar. Bir rol verilirse düz o renk.",
    `<Rate defaultValue={3} aria-label="Puan" />            {/* varsayılan: puan sarısı */}
<Rate color="primary" defaultValue={3} aria-label="Puan" />`
  ),
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Rate defaultValue={3.5} allowHalf aria-label="Varsayılan puan" />
        <span className="text-xs text-mari-muted">varsayılan (puan sarısı)</span>
      </div>
      {(["primary", "accent", "success", "error", "info", "neutral"] as const).map((color) => (
        <div key={color} className="flex items-center gap-3">
          <Rate color={color} defaultValue={3} aria-label={`${color} puan`} />
          <span className="text-xs text-mari-muted">{color}</span>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  name: "Devre Dışı",
  ...storyDoc("`disabled` — ne fare ne klavye ile değişir; imleç \"izin yok\". Salt puan GÖSTERMEK için `disabled` değil `readOnly` kullanın."),
  args: {
    defaultValue: 4.5,
    allowHalf: true,
    characterSize: "2rem",
    disabled: true,
  },
};

const PRODUCTS = [
  { name: "Kablosuz kulaklık", rating: 4.3, reviews: 1284, price: "1.899 ₺" },
  { name: "Mekanik klavye", rating: 4.8, reviews: 312, price: "2.450 ₺" },
  { name: "USB-C hub", rating: 3.6, reviews: 58, price: "649 ₺" },
];

export const ReadOnly: Story = {
  name: "Salt Gösterim (ürün kartı)",
  ...storyDoc(
    "`readOnly` — ortalama puanı göstermek için: etkileşim ve odak yok, ondalık değer yıldızın o oranına kadar dolar (4,3 → 5. yıldızın %30'u). " +
      "Ekran okuyucu tek bir görsel olarak \"Ortalama puan: 4,3 / 5\" okur.",
    `<Rate readOnly value={4.3} characterSize="1rem" aria-label="Ortalama puan" />
<span>4,3 (1.284 değerlendirme)</span>`
  ),
  render: () => (
    <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
      {PRODUCTS.map((p) => (
        <div key={p.name} className="flex flex-col gap-1.5 rounded-lg border border-mari-border p-4">
          <p className="text-sm font-medium text-mari-foreground">{p.name}</p>
          <div className="flex items-center gap-1.5">
            <Rate readOnly value={p.rating} characterSize="1rem" aria-label="Ortalama puan" />
            <span className="text-xs text-mari-muted">
              {p.rating.toLocaleString("tr-TR")} ({p.reviews.toLocaleString("tr-TR")})
            </span>
          </div>
          <p className="text-sm font-semibold text-mari-foreground">{p.price}</p>
        </div>
      ))}
    </div>
  ),
};

const LABELS = ["", "Çok kötü", "Kötü", "Fena değil", "İyi", "Mükemmel"];

function ReviewDemo() {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-col gap-2">
      <span id="rate-review" className="text-sm font-medium text-mari-foreground">
        Ürünü puanlayın
      </span>
      <div className="flex items-center gap-3">
        <Rate value={value} onChange={setValue} onHoverChange={setHover} characterSize="2rem" aria-label="Ürünü puanlayın" />
        <span className="min-w-24 text-sm text-mari-muted" aria-live="polite">
          {LABELS[Math.ceil(shown)] || "Seçilmedi"}
        </span>
      </div>
    </div>
  );
}

export const ReviewForm: Story = {
  name: "Değerlendirme Formu",
  ...storyDoc(
    "Puan verirken üzerine gelinen yıldızın anlamı yanda yazar (`onHoverChange`). Dokunmatikte yıldızlar arası boşluk artar ve her yıldız 44px yüksek bir hedeftir.",
    `<Rate value={value} onChange={setValue} onHoverChange={setHover} characterSize="2rem" aria-label="Ürünü puanlayın" />
<span aria-live="polite">{LABELS[hover || value]}</span>`
  ),
  render: () => <ReviewDemo />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc("`skeleton` — puan gelene kadar yıldız boyutunda yer tutucular.", `<Rate readOnly skeleton={isLoading} value={product.rating} />`),
  args: { skeleton: true, characterSize: "1rem" },
};
