/**
 * Faz 16.1: gerçek senaryolar — sepette adet, fiyat girişi (₺, 2 basamak),
 * indirim yüzdesi, ölçü (kg, 0.5 adım). "Show code" her story'de `storyDoc`'un
 * 2. argümanıyla verilen kopyalanabilir kod. Story seviyesinde `parameters`
 * YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { InputNumber } from "./InputNumber";
import { Field } from "../field";

const meta: Meta<typeof InputNumber> = {
  title: "Veri Girişi/InputNumber",
  component: InputNumber,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Sayı girişi: Türkçe biçim (odak dışında \"1.234,56\", yazarken \"1234,56\"), `min`/`max`/`step`/`precision`, " +
            "önek/sonek (₺, %, kg) ve artır/azalt düğmeleri. Alışkanlıkla yazılan \"12.5\" de ondalık anlaşılır; harf hiç " +
            "girmez. Sınırlar yazarken engellenmez, alandan çıkınca (ya da Enter'da) değer sınıra çekilir. Görünümü Input'la " +
            "birebir aynı.",
          whenToUse: ["Adet, fiyat, yüzde, ölçü gibi sayısal değerler — özellikle ondalık ve binlik ayıracı gerektiğinde."],
          whenNotToUse: [
            "Telefon, kart, posta kodu gibi \"rakamdan oluşan metinler\" — onlar sayı değil; Input `mask` + `inputMode=\"numeric\"`.",
            "Kaba bir aralıkta hızlı seçim — Slider.",
          ],
          a11y:
            "`role=\"spinbutton\"` + `aria-valuenow/min/max` ve önek/sonekli `aria-valuetext` (\"1.499,90 ₺\"). Klavye: ↑/↓ adım, " +
            "Shift ile ×10, PageUp/PageDown ×10, Home/End min/max, Enter onaylar. Artır/azalt düğmeleri adlandırılmış ama Tab " +
            "sırasında değil (klavyede ok tuşları var). Mobilde uygun sayısal klavye (`inputMode`); dokunmatikte düğmeler " +
            "yan yana −/+ ve 44px hedef. Basılı tutunca adım tekrarlanır.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: "number" },
    onChange: { table: { category: "Olaylar" } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number", description: "Adım. Shift/PageUp ile 10 katı. Varsayılan: `1`." },
    precision: { control: "number", description: "Sabit ondalık basamak (para için 2)." },
    grouping: { control: "boolean", description: "Binlik ayıracı. Varsayılan: `true`." },
    locale: { control: "text", description: "Varsayılan: `tr-TR`." },
    prefix: { control: "text" },
    suffix: { control: "text" },
    controls: { control: "boolean", description: "Artır/azalt düğmeleri. Varsayılan: `true`." },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    size: baseSizeArgType,
    variant: { control: "inline-radio", options: ["outline", "soft", "ghost", "underlined"], table: { category: "Görünüm" } },
    color: { ...colorArgType, description: "`error`/`warning`: doğrulama durumu (Input'la aynı)." },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof InputNumber>;

const tl = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";

/* ─────────────────────────── 1. Sepet ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    "aria-label": "Değer",
    defaultValue: 1234.5,
    min: 0,
    max: 100000,
    step: 1,
    precision: 2,
    grouping: true,
    locale: "tr-TR",
    prefix: "₺",
    controls: true,
    disabled: false,
    readOnly: false,
    size: "md",
    variant: "outline",
    skeleton: false,
  },
  render: (args) => (
    <div className="max-w-xs">
      <InputNumber {...args} />
    </div>
  ),
};

export const CartQuantity: Story = {
  name: "Sepette Adet",
  ...storyDoc(
    "Stoğa göre `max`, en az 1 (`min`). `precision={0}` mobilde ondalıksız sayısal klavye açar. Tutar anında güncellenir; " +
      "düğmeye basılı tutmak adımı tekrarlar.",
    `<InputNumber aria-label="Adet" min={1} max={stock} precision={0} value={qty} onChange={(v) => setQty(v ?? 1)} />`
  ),
  render: () => {
    const [qty, setQty] = useState<number>(2);
    const price = 1899;
    return (
      // Dar ekranda ürün adı kendi satırında, adet + tutar altta.
      <div className="flex max-w-md flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-mari-border bg-mari-surface p-4">
        <div className="min-w-0 basis-full sm:basis-auto sm:flex-1">
          <p className="truncate font-medium text-mari-foreground">Kablosuz kulaklık</p>
          <p className="text-xs text-mari-muted">Stokta 8 adet · {tl(price)}</p>
        </div>
        <InputNumber aria-label="Adet" min={1} max={8} precision={0} value={qty} onChange={(v) => setQty(v ?? 1)} className="w-24" />
        <p className="ml-auto whitespace-nowrap text-right font-semibold tabular-nums text-mari-foreground">{tl(price * qty)}</p>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Ürün fiyatlandırma ─────────────────────────── */

export const Pricing: Story = {
  name: "Ürün Fiyatlandırma",
  ...storyDoc(
    "Para: `precision={2}` + `prefix=\"₺\"`; yazarken \"1499,9\" ya da \"1499.9\", alandan çıkınca \"1.499,90\". Yüzde: " +
      "`suffix=\"%\"`, 0–100. Ağırlık: `step={0.5}` ve `kg`. Satış fiyatı hesaplanır.",
    `
<InputNumber id="price" prefix="₺" precision={2} min={0} value={price} onChange={setPrice} />
<InputNumber id="discount" suffix="%" min={0} max={100} value={discount} onChange={setDiscount} />
<InputNumber id="weight" suffix="kg" step={0.5} min={0} precision={1} value={weight} onChange={setWeight} />`
  ),
  render: () => {
    const [price, setPrice] = useState<number | null>(1499.9);
    const [discount, setDiscount] = useState<number | null>(15);
    const [weight, setWeight] = useState<number | null>(0.5);
    const sale = (price ?? 0) * (1 - (discount ?? 0) / 100);
    return (
      <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
        <Field label="Liste fiyatı">
          <InputNumber id="price" prefix="₺" precision={2} min={0} step={10} value={price} onChange={setPrice} />
        </Field>
        <Field label="İndirim" hint={`Satış fiyatı: ${tl(sale)}`}>
          <InputNumber id="discount" suffix="%" min={0} max={100} value={discount} onChange={setDiscount} />
        </Field>
        <Field label="Kargo ağırlığı" hint="0,5 kg adımlarla">
          <InputNumber id="weight" suffix="kg" step={0.5} min={0} precision={1} value={weight} onChange={setWeight} />
        </Field>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Görünüm ve durumlar ─────────────────────────── */

export const Appearance: Story = {
  name: "Boyut, Görünüm ve Durumlar",
  ...storyDoc(
    "Boyut/varyant/şekil Input'la aynı ölçek. `controls={false}` düğmesiz (ok tuşları yine çalışır); `color=\"error\"` " +
      "doğrulama; `readOnly`, `disabled`.",
    `<InputNumber size="sm" variant="soft" controls={false} … />`
  ),
  render: () => (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <InputNumber key={size} size={size} aria-label={`Adet (${size})`} defaultValue={12} />
      ))}
      <InputNumber variant="soft" aria-label="Adet (soft)" defaultValue={12} />
      <InputNumber variant="underlined" aria-label="Adet (underlined)" defaultValue={12} controls={false} />
      <InputNumber shape="pill" aria-label="Adet (pill)" defaultValue={12} />
      <InputNumber color="error" aria-label="Adet (hatalı)" defaultValue={0} min={1} />
      <InputNumber readOnly aria-label="Adet (salt okunur)" defaultValue={12} />
      <InputNumber disabled aria-label="Adet (devre dışı)" defaultValue={12} />
          </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<InputNumber aria-label="Adet" defaultValue={3} skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <InputNumber aria-label="Adet" defaultValue={3} min={1} max={10} skeleton={skeleton} />}</SkeletonDemo>,
};
