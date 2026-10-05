import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, type RadioValue } from "./Radio";
import { Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof RadioGroup> = {
  title: "Native/Veri Girişi/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Birbirini dışlayan seçeneklerden birini seçtirir. `options` ya da `Radio` çocukları.",
    whenToUse: ["Teslimat, ödeme yöntemi gibi 2–6 seçenek.", "Seçenekleri açıklamasıyla görmek gerektiğinde."],
    whenNotToUse: ["Çok sayıda seçenek — Select.", "Görünümü değiştiren 2–4 kısa seçenek — Segmented."],
    vsWeb: "Prop'lar aynı; `orientation` native'de varsayılan `vertical` (telefonda seçenekler alt alta okunur ve dokunulur; web varsayılanı `horizontal`). Grup `accessibilityRole=\"radiogroup\"`; görünür başlığı `accessibilityLabel` olarak tekrarlayın.",
  }) } } },
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "solid"] },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { orientation: "vertical", size: "md", variant: "outline", disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {
  ...storyDoc("Yerleşim, boyut ve varyantı deneyin."),
  render: (args) => <RadioGroup {...args} accessibilityLabel="Beden" defaultValue="M" options={["S", "M", "L", "XL"]} />,
};

const DELIVERY = [
  { value: "standard", label: "Standart teslimat", description: "3–5 iş günü · Ücretsiz" },
  { value: "express", label: "Hızlı teslimat", description: "Yarın kapında · ₺49,90" },
  { value: "pickup", label: "Mağazadan teslim al", description: "Bugün 18:00'den sonra · Ücretsiz" },
  { value: "sameday", label: "Aynı gün", description: "Bu adreste şu an kullanılamıyor", disabled: true },
];

function Delivery() {
  const [value, setValue] = useState<RadioValue>("standard");
  return (
    <View style={{ alignSelf: "stretch", gap: 4 }}>
      <Title level={5}>Teslimat seçeneği</Title>
      <RadioGroup accessibilityLabel="Teslimat seçeneği" value={value} onChange={setValue} options={DELIVERY} />
      <Text muted>{`Seçili: ${DELIVERY.find((d) => d.value === value)?.label}`}</Text>
    </View>
  );
}

export const DeliveryStory: Story = {
  name: "Teslimat Seçimi (açıklamalı)",
  ...storyDoc("Açıklamalı seçenekler; kullanılamayan seçenek `disabled`.", `<RadioGroup accessibilityLabel="Teslimat seçeneği" value={value} onChange={setValue} options={[
  { value: "standard", label: "Standart teslimat", description: "3–5 iş günü · Ücretsiz" },
]} />`),
  render: () => <Delivery />,
};

export const Variants: Story = {
  name: "Renk × Varyant",
  ...storyDoc("Grup rengi ve varyantı tüm seçeneklere geçer; yatay yerleşim kısa seçenekler için.", `<RadioGroup orientation="horizontal" color="success" defaultValue="a" options={[{ value: "a", label: "Açık" }, { value: "b", label: "Kapalı" }]} />
<RadioGroup orientation="horizontal" variant="solid" color="accent" options={["Aylık", "Yıllık"]} />`),
  render: () => (
    <Stack>
      <RadioGroup accessibilityLabel="Renk" orientation="horizontal" color="success" defaultValue="a" options={[{ value: "a", label: "Açık" }, { value: "b", label: "Kapalı" }]} />
      <RadioGroup accessibilityLabel="Renk" orientation="horizontal" variant="solid" color="accent" defaultValue="b" options={[{ value: "a", label: "Aylık" }, { value: "b", label: "Yıllık" }]} />
      <RadioGroup accessibilityLabel="Doğrulama" orientation="horizontal" color="error" options={["Evet", "Hayır"]} />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<RadioGroup skeleton={isLoading} options={deliveryOptions} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => <RadioGroup skeleton={skeleton} accessibilityLabel="Teslimat" defaultValue="standard" options={DELIVERY.slice(0, 3)} />}
    </SkeletonDemo>
  ),
};
