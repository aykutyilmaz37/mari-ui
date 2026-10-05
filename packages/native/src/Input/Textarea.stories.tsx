import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";
import { Button } from "../Button";
import { Field } from "../Field";
import { Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, withStretch, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Textarea> = {
  title: "Native/Veri Girişi/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Çok satırlı metin alanı: mesaj, açıklama, değerlendirme.",
    whenToUse: ["Bir satırı aşabilecek serbest metin.", "Karakter sınırı olan içerik (sayaçla)."],
    whenNotToUse: ["Tek satırlık değer — `Input`."],
    vsWeb: "Prop'lar aynı (`onChangeText` değer verir). Kutu, renk ve odak kuralları Input ile aynı; `rows` başlangıç yüksekliği, `autoSize` içerikle büyür (`maxRows` sonrası alan içinde kaydırılır). Sayaç sağ altta metnin üstüne binmez. `pill` biçimi yok. `Field` içinde etiket/hata oradan gelir.",
  }) } } },
  argTypes: {
    placeholder: { control: "text" },
    rows: { control: { type: "number", min: 1, max: 10 } },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"] },
    maxLength: { control: "number" },
    showCount: { control: "boolean" },
    allowClear: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { placeholder: "Siparişinizle ilgili notunuz", rows: 3, size: "md", variant: "outline", showCount: false, allowClear: false, disabled: false, skeleton: false, accessibilityLabel: "Sipariş notu" },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  ...storyDoc("Satır, boyut, varyant, sayaç ve temizlemeyi deneyin."),
  decorators: [withStretch],
  render: (args) => <Textarea {...args} />,
};

export const Message: Story = {
  name: "Mesaj Kutusu (min/max satır)",
  ...storyDoc(
    "Sohbet kutusu: 1 satırla başlar, yazdıkça 4 satıra kadar büyür, sonra alan içinde kayar.",
    `<Textarea autoSize={{ minRows: 1, maxRows: 4 }} placeholder="Mesaj yazın" accessibilityLabel="Mesaj" />`
  ),
  render: () => (
    <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
      <Textarea style={{ flex: 1 }} autoSize={{ minRows: 1, maxRows: 4 }} placeholder="Mesaj yazın" accessibilityLabel="Mesaj" />
      <Button>Gönder</Button>
    </View>
  ),
};

function ReviewDemo() {
  const [text, setText] = useState("");
  const tooShort = text.length > 0 && text.length < 20;
  return (
    <View style={{ alignSelf: "stretch", gap: 16 }}>
      <View style={{ gap: 2 }}>
        <Title level={5}>Kablosuz Kulaklık</Title>
        <Text muted>Teslim edildi · 3 Ekim</Text>
      </View>
      <Field label="Değerlendirmeniz" hint="En az 20 karakter." error={tooShort ? "Biraz daha ayrıntı ekleyin (en az 20 karakter)." : undefined}>
        <Textarea value={text} onChangeText={setText} rows={4} maxLength={500} showCount placeholder="Ürünü nasıl buldunuz?" />
      </Field>
    </View>
  );
}

export const Review: Story = {
  name: "Ürün Değerlendirmesi (sayaçlı)",
  ...storyDoc(
    "Field içinde: etiket, ipucu, kısa metinde hata; 500 karakter sayacı.",
    `<Field label="Değerlendirmeniz" hint="En az 20 karakter." error={tooShort ? "Biraz daha ayrıntı ekleyin." : undefined}>
  <Textarea value={text} onChangeText={setText} rows={4} maxLength={500} showCount />
</Field>`
  ),
  render: () => <ReviewDemo />,
};

export const Variants: Story = {
  name: "Varyant × Boyut",
  ...storyDoc("outline, soft, ghost, underlined; sm/md/lg.", `<Textarea variant="soft" size="sm" rows={2} />`),
  render: () => (
    <Stack>
      {(["outline", "soft", "ghost", "underlined"] as const).map((variant) => <Textarea key={variant} variant={variant} rows={2} placeholder={variant} accessibilityLabel={variant} />)}
      {(["sm", "lg"] as const).map((size) => <Textarea key={size} size={size} rows={2} placeholder={`Boyut ${size}`} accessibilityLabel={size} />)}
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Field label="Teslimat notu" skeleton={isLoading}>
  <Textarea rows={3} showCount maxLength={200} defaultValue={order.note} />
</Field>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Field label="Teslimat notu" skeleton={skeleton}>
          <Textarea rows={3} showCount maxLength={200} defaultValue="Zile basmayın, kapıya bırakın." />
        </Field>
      )}
    </SkeletonDemo>
  ),
};
