import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Rate } from "./Rate";
import { Card } from "../Card";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Rate> = {
  title: "Native/Veri Girişi/Rate",
  component: Rate,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Yıldız tabanlı puan girişi; yarım puan (`allowHalf`) ve aynı puana yeniden dokunarak temizleme (`allowClear`).",
    whenToUse: ["Kullanıcıdan memnuniyet/kalite puanı almak.", "Ürün kartında ortalama puanı göstermek (`readOnly`)."],
    whenNotToUse: ["Kesin bir sayısal değer gerekiyorsa — Slider ya da sayı girişi."],
    vsWeb: "Prop'lar aynı (`aria-label` → `accessibilityLabel`, `characterSize` yalnız sayı/pt, varsayılan 28). Dokunarak ya da parmağı yıldızlar üzerinde KAYDIRARAK puanlanır; `onHoverChange` sürükleme önizlemesini verir (bırakınca 0). Dokunma alanı 44pt yüksek. Ekran okuyucuda `adjustable`: yukarı/aşağı kaydırma artırır/azaltır. Özel `character` fonksiyonu `{ index, filled, color }` alır (RN'de `currentColor` yok).",
  }) } } },
  argTypes: {
    count: { control: { type: "number", min: 1, max: 10 } },
    characterSize: { control: { type: "number", min: 16, max: 48 } },
    allowHalf: { control: "boolean" },
    allowClear: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    skeleton: { control: "boolean" },
    color: { control: "select", options: [undefined, "primary", "accent", "success", "error", "warning", "info", "neutral"] },
  },
  args: { count: 5, defaultValue: 3, characterSize: 28, allowHalf: false, allowClear: true, disabled: false, readOnly: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Rate>;

export const Playground: Story = {
  ...storyDoc("Dokunun ya da parmağınızı yıldızlar üzerinde kaydırın."),
  render: (args) => <Rate {...args} />,
};

export const AllowHalf: Story = {
  name: "Yarım Puan",
  ...storyDoc("`allowHalf`: yıldızın sol yarısı yarım puan.", `<Rate allowHalf defaultValue={3.5} />`),
  render: () => <Rate allowHalf defaultValue={3.5} />,
};

const PRODUCTS = [
  { name: "Kablosuz kulaklık", rating: 4.3, reviews: 1284, price: "1.899 ₺" },
  { name: "Mekanik klavye", rating: 4.8, reviews: 312, price: "2.450 ₺" },
  { name: "USB-C hub", rating: 3.6, reviews: 58, price: "649 ₺" },
];

const tr = (n: number) => String(n).replace(".", ",");

export const ReadOnly: Story = {
  name: "Salt Gösterim (ürün kartı)",
  ...storyDoc(
    "`readOnly`: etkileşim yok, ondalık değer yıldızın o oranına kadar dolar (4,3 → 5. yıldızın %30'u). Ekran okuyucu tek görsel olarak \"Ortalama puan: 4,3 / 5\" okur.",
    `<Rate readOnly value={4.3} characterSize={16} accessibilityLabel="Ortalama puan" />
<Text muted style={{ fontSize: 13 }}>4,3 (1.284)</Text>`
  ),
  render: () => (
    <Stack>
      {PRODUCTS.map((p) => (
        <Card key={p.name} size="sm">
          <View style={{ gap: 6 }}>
            <Text weight="medium">{p.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Rate readOnly value={p.rating} characterSize={16} accessibilityLabel="Ortalama puan" />
              <Text muted style={{ fontSize: 13 }}>{`${tr(p.rating)} (${p.reviews.toLocaleString("tr-TR")})`}</Text>
            </View>
            <Text weight="semibold">{p.price}</Text>
          </View>
        </Card>
      ))}
    </Stack>
  ),
};

const LABELS = ["", "Çok kötü", "Kötü", "Fena değil", "İyi", "Mükemmel"];

function ReviewDemo() {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <View style={{ gap: 8 }}>
      <Text weight="medium">Ürünü puanlayın</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Rate value={value} onChange={setValue} onHoverChange={setHover} characterSize={32} accessibilityLabel="Ürünü puanlayın" />
        <Text muted accessibilityLiveRegion="polite">{LABELS[Math.ceil(shown)] || "Seçilmedi"}</Text>
      </View>
    </View>
  );
}

export const ReviewForm: Story = {
  name: "Değerlendirme Formu",
  ...storyDoc(
    "Parmak yıldızlar üzerinde gezinirken anlamı yanda yazar (`onHoverChange`); bırakınca puan işlenir.",
    `<Rate value={value} onChange={setValue} onHoverChange={setHover} characterSize={32} accessibilityLabel="Ürünü puanlayın" />
<Text muted accessibilityLiveRegion="polite">{LABELS[hover || value]}</Text>`
  ),
  render: () => <ReviewDemo />,
};

export const AllColors: Story = {
  name: "Renkler",
  ...storyDoc(
    "`color` verilmezse (önerilen) puan token'ı (parlak sarı). Bir rol verilirse düz o renk.",
    `<Rate defaultValue={3} />
<Rate color="primary" defaultValue={3} />`
  ),
  render: () => (
    <Stack>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Rate defaultValue={3.5} allowHalf accessibilityLabel="Varsayılan puan" />
        <Text muted style={{ fontSize: 13 }}>varsayılan</Text>
      </View>
      {(["primary", "accent", "success", "error", "info", "neutral"] as const).map((color) => (
        <View key={color} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Rate color={color} defaultValue={3} accessibilityLabel={`${color} puan`} />
          <Text muted style={{ fontSize: 13 }}>{color}</Text>
        </View>
      ))}
    </Stack>
  ),
};

export const Disabled: Story = {
  name: "Durumlar",
  ...storyDoc("`disabled`: değişmez, soluk. Puanı yalnız GÖSTERMEK için `disabled` değil `readOnly` kullanın.", `<Rate disabled allowHalf defaultValue={4.5} />`),
  render: () => <Rate disabled allowHalf defaultValue={4.5} />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Rate readOnly skeleton={isLoading} value={product.rating} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Rate readOnly skeleton={skeleton} value={4.3} characterSize={16} />}</SkeletonDemo>,
};
