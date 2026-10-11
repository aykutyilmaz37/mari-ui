import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { InputNumber, type InputNumberProps } from "./InputNumber";
import { Field } from "../Field";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNarrow, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof InputNumber> = {
  title: "Native/Veri Girişi/InputNumber",
  component: InputNumber,
  tags: ["autodocs"],
  decorators: [withNarrow, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Sayı alanı: Türkçe biçim (1.234,56), `min` / `max`, `step`, sabit ondalık (`precision`), ön/son ek (₺, %, kg). −/+ iki yanda; basılı tutunca tekrarlar.",
    whenToUse: ["Adet, fiyat, yüzde, ölçü gibi sayısal girişler.", "Sınırlı aralıkta küçük adımlarla değişen değer (sepette adet)."],
    whenNotToUse: ["Telefon, kart, kimlik numarası gibi sayı olmayan rakam dizileri — Input (`mask`).", "Geniş aralıkta kabaca seçim — Slider."],
    vsWeb: "API web InputNumber ile aynı (`aria-label` → `accessibilityLabel`). Düğmeler sağda üst üste değil, iki yanda (mobil adet seçici) ve basılı tutunca tekrarlar; klavye ok tuşları yerine VoiceOver / TalkBack'te yukarı/aşağı kaydırma artırır/azaltır. Klavye kendiliğinden: eksi gerekmiyorsa sayı / ondalık tuş takımı, gerekiyorsa noktalamalı. Odaktayken binlik ayıracı gizlenir (1234,56), çıkınca sınıra çekilip biçimlenir.",
  }) } } },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    precision: { control: "number" },
    controls: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    skeleton: { control: "boolean" },
  },
  args: { defaultValue: 1250, min: 0, step: 50, controls: true, disabled: false, size: "md", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof InputNumber>;

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args: InputNumberProps) => <InputNumber {...args} accessibilityLabel="Tutar" />,
};

function CartDemo() {
  const [qty, setQty] = useState<number | null>(2);
  const unit = 349.9;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text weight="medium">Kablosuz Kulaklık</Text>
          <Text muted>349,90 ₺ / adet · stokta 10</Text>
        </View>
        <InputNumber value={qty} onChange={setQty} min={1} max={10} precision={0} size="sm" style={{ width: 128 }} accessibilityLabel="Adet" />
      </View>
      <Text weight="semibold">{`Toplam: ${((qty ?? 0) * unit).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`}</Text>
    </View>
  );
}

export const CartQuantity: Story = {
  name: "Sepette Adet",
  ...storyDoc(
    "Adet seçici: `min={1}` `max={10}` — sınırdayken düğme pasif. Düğmeyi basılı tutunca adım tekrarlar. Değer ortada, tam sayı klavyesi.",
    `<InputNumber value={qty} onChange={setQty} min={1} max={10} precision={0} size="sm" style={{ width: 128 }} accessibilityLabel="Adet" />`
  ),
  render: () => <CartDemo />,
};

function PricingDemo() {
  const [price, setPrice] = useState<number | null>(1249.9);
  const [discount, setDiscount] = useState<number | null>(15);
  const [weight, setWeight] = useState<number | null>(0.75);
  const final = price !== null && discount !== null ? price * (1 - discount / 100) : null;
  return (
    <View style={{ gap: 12 }}>
      <Field label="Liste fiyatı">
        <InputNumber value={price} onChange={setPrice} min={0} precision={2} step={10} prefix="₺" controls={false} />
      </Field>
      <Field label="İndirim" hint="0–90 arası.">
        <InputNumber value={discount} onChange={setDiscount} min={0} max={90} step={5} suffix="%" />
      </Field>
      <Field label="Ağırlık">
        <InputNumber value={weight} onChange={setWeight} min={0} step={0.05} suffix="kg" />
      </Field>
      <Text muted>{final === null ? "—" : `Satış fiyatı: ${final.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`}</Text>
    </View>
  );
}

export const Pricing: Story = {
  name: "Ürün Fiyatlandırma",
  ...storyDoc(
    "`precision={2}` para: her zaman iki ondalık (1.249,90). Ön ek ₺, son ek % / kg. Fiyatta düğme yok (`controls={false}`) — fiyat yazılır. `step={0.05}` gibi ondalık adımda kayan nokta artığı oluşmaz. Odaktayken binlik ayıracı gizlenir; \"12.5\" yazmak da 12,5 sayılır.",
    `<InputNumber value={price} onChange={setPrice} min={0} precision={2} prefix="₺" controls={false} />
<InputNumber value={discount} onChange={setDiscount} min={0} max={90} step={5} suffix="%" />`
  ),
  render: () => <PricingDemo />,
};

export const Appearance: Story = {
  name: "Boyut, Görünüm ve Durumlar",
  ...storyDoc("Alan Input ölçeğinde (sm / md / lg) ve görünümlerinde; pasif, salt okunur ve hata durumu.", `<InputNumber size="lg" />  <InputNumber variant="soft" />  <InputNumber disabled />`),
  render: () => (
    <View style={{ gap: 12 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <InputNumber key={size} size={size} defaultValue={3} min={0} accessibilityLabel={`Boyut ${size}`} />
      ))}
      <InputNumber variant="soft" defaultValue={42} accessibilityLabel="Soft" />
      <InputNumber disabled defaultValue={7} accessibilityLabel="Pasif" />
      <InputNumber readOnly defaultValue={12} accessibilityLabel="Salt okunur" />
      <Field label="Stok" error="Stok negatif olamaz.">
        <InputNumber defaultValue={-3} />
      </Field>
    </View>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Alan kendi kutusunda; Field içindeyse etiket ve ipucu da.", `<Field label="Adet" skeleton={isLoading}><InputNumber value={qty} /></Field>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Field label="Adet" hint="En fazla 10." skeleton={skeleton}>
          <InputNumber defaultValue={2} min={1} max={10} />
        </Field>
      )}
    </SkeletonDemo>
  ),
};
