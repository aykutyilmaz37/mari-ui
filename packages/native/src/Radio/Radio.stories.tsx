import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "./Radio";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const COLORS = ["primary", "accent", "success", "warning", "error", "info", "neutral"] as const;

const meta: Meta<typeof Radio> = {
  title: "Native/Veri Girişi/Radio",
  component: Radio,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Tek seçenek. Çoğunlukla `RadioGroup` içinde; tek başına bir onay seçeneği olarak da kullanılabilir.",
    whenToUse: ["Birbirini dışlayan seçenekler — `RadioGroup` ile."],
    whenNotToUse: ["Bağımsız açık/kapalı — `Checkbox` ya da `Switch`."],
    vsWeb: "Prop'lar aynı; tek başına `onChange(checked)`, grupta `RadioGroup.onChange(value)`. Daire sm 18 · md 22 · lg 26, 2pt kenar; satır en az 44pt. Seçim dokunarak geri alınmaz.",
  }) } } },
  argTypes: {
    label: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "solid"] },
    color: { control: "select", options: [undefined, ...COLORS] },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { label: "Kapıda ödeme", size: "md", variant: "outline", disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Radio>;

export const Playground: Story = {
  ...storyDoc("Tek başına Radio; dokununca seçilir."),
  render: (args) => <Radio {...args} />,
};

function Controlled() {
  const [method, setMethod] = useState<"card" | "cash">("card");
  return (
    <View style={{ alignSelf: "stretch" }}>
      <Radio label="Kartla öde" checked={method === "card"} onChange={() => setMethod("card")} />
      <Radio label="Kapıda nakit" checked={method === "cash"} onChange={() => setMethod("cash")} />
      <Text muted>{`Seçili: ${method === "card" ? "Kart" : "Nakit"}`}</Text>
    </View>
  );
}

export const ControlledStory: Story = {
  name: "Kontrollü",
  ...storyDoc("`checked` + `onChange` ile dışarıdan yönetim; birden çok seçenek için `RadioGroup` daha kısa.", `<Radio label="Kartla öde" checked={method === "card"} onChange={() => setMethod("card")} />`),
  render: () => <Controlled />,
};

export const Variants: Story = {
  name: "Renk × Varyant × Boyut",
  ...storyDoc("outline: rol kenarı + dolu nokta; solid: rol dolgusu + yüzey noktası.", `<Radio defaultChecked color="success" label="outline" />
<Radio defaultChecked variant="solid" color="accent" label="solid" />
<Radio size="lg" defaultChecked label="lg" />`),
  render: () => (
    <Stack>
      {(["outline", "solid"] as const).map((variant) => (
        <View key={variant} style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 16 }}>
          {COLORS.map((color) => <Radio key={color} variant={variant} color={color} defaultChecked accessibilityLabel={`${variant} ${color}`} />)}
        </View>
      ))}
      <View style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}>
        {(["sm", "md", "lg"] as const).map((size) => <Radio key={size} size={size} defaultChecked label={size} />)}
      </View>
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Radio skeleton={isLoading} label="Kapıda ödeme" />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View>
          <Radio skeleton={skeleton} defaultChecked label="Kartla öde" />
          <Radio skeleton={skeleton} label="Kapıda nakit" description="+₺15 hizmet bedeli" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
