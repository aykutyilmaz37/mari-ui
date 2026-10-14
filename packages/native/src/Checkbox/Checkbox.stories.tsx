import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Divider } from "../Divider";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const COLORS = ["primary", "accent", "success", "warning", "error", "info", "neutral"] as const;

const meta: Meta<typeof Checkbox> = {
  title: "Native/Veri Girişi/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Bağımsız açık/kapalı seçim; çoklu seçim listeleri ve onaylar için.",
    whenToUse: ["Birden çok seçeneğin seçilebildiği listeler.", "Koşul/izin onayı (\"Okudum, kabul ediyorum\").", "\"Tümünü seç\" — alt öğelerin bir kısmı seçiliyse `indeterminate`."],
    whenNotToUse: ["Anında etki eden açma/kapama (bildirimler) — `Switch`.", "Tek seçim — `RadioGroup`."],
    vsWeb: "Prop'lar aynı; `onChange(checked: boolean)` (olay nesnesi yok). Kutu M3 ölçüsünde: sm 18 · md 22 · lg 26, 2pt kenar. Satırın tamamı dokunulabilir ve en az 44pt (HIG). Etiket md = Body 17/22. Eski `status`/`type` native'de yok, `color` kullanın. Devre dışı halde durum rengi %50 korunur.",
  }) } } },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "select", options: ["default", "pill", "square"] },
    variant: { control: "select", options: ["outline", "solid"] },
    color: { control: "select", options: [undefined, ...COLORS] },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { label: "Beni hatırla", size: "md", shape: "default", variant: "outline", indeterminate: false, disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  ...storyDoc("Boyut, biçim, varyant ve rengi deneyin."),
  render: (args) => <Checkbox {...args} />,
};

const TOPPINGS = ["Mantar", "Zeytin", "Mısır", "Biber"];

function SelectAll() {
  const [selected, setSelected] = useState<string[]>(["Mantar"]);
  const all = selected.length === TOPPINGS.length;
  const toggle = (item: string, on: boolean) => setSelected((current) => (on ? [...current, item] : current.filter((i) => i !== item)));
  return (
    <View style={{ alignSelf: "stretch" }}>
      <Checkbox label="Tüm malzemeler" checked={all} indeterminate={!all && selected.length > 0} onChange={(on) => setSelected(on ? TOPPINGS : [])} />
      <Divider size="sm" />
      <View style={{ paddingLeft: 34 }}>
        {TOPPINGS.map((item) => <Checkbox key={item} label={item} checked={selected.includes(item)} onChange={(on) => toggle(item, on)} />)}
      </View>
    </View>
  );
}

export const Indeterminate: Story = {
  name: "Tümünü Seç (Belirsiz)",
  ...storyDoc("Alt öğelerin bir kısmı seçiliyken üst kutu `indeterminate` (ekran okuyucuda \"kısmen seçili\"); dokununca hepsi seçilir.", `<Checkbox label="Tüm malzemeler" checked={all} indeterminate={some && !all} onChange={selectAll} />`),
  render: () => <SelectAll />,
};

export const Permissions: Story = {
  name: "Açıklamalı (İzinler)",
  ...storyDoc("Etiketin altında açıklama; kutu etiketin ilk satırıyla hizalı. Zorunlu onay hatalıyken `color=\"error\"`.", `<Checkbox label="Konum" description="Yakındaki mağazaları göstermek için" />`),
  render: () => (
    <View style={{ alignSelf: "stretch" }}>
      <Checkbox defaultChecked label="Konum" description="Yakındaki mağazaları ve teslimat süresini göstermek için" />
      <Checkbox label="Kişiler" description="Arkadaşlarınızı davet edebilmeniz için" />
      <Checkbox color="error" label="Kullanım koşullarını okudum ve kabul ediyorum" description="Devam etmek için onaylamanız gerekiyor" />
    </View>
  ),
};

export const Variants: Story = {
  name: "Renk × Varyant × Boyut",
  ...storyDoc("outline (varsayılan) ve solid; rol renkleri; sm/md/lg.", `<Checkbox defaultChecked color="success" />
<Checkbox defaultChecked variant="solid" color="accent" />
<Checkbox size="lg" defaultChecked label="lg" />`),
  render: () => (
    <Stack>
      {(["outline", "solid"] as const).map((variant) => (
        <View key={variant} style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 16 }}>
          {COLORS.map((color) => <Checkbox key={color} variant={variant} color={color} defaultChecked accessibilityLabel={`${variant} ${color}`} />)}
        </View>
      ))}
      <View style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}>
        {(["sm", "md", "lg"] as const).map((size) => <Checkbox key={size} size={size} defaultChecked label={size} />)}
      </View>
    </Stack>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Devre dışı: durum rengi %50 korunur, etiket soluk; basılınca tepki yok.", `<Checkbox disabled label="Devre dışı" />
<Checkbox disabled defaultChecked label="Devre dışı, seçili" />
<Checkbox disabled indeterminate label="Devre dışı, kısmen" />`),
  render: () => (
    <View style={{ alignSelf: "stretch" }}>
      <Checkbox disabled label="Devre dışı" />
      <Checkbox disabled defaultChecked label="Devre dışı, seçili" />
      <Checkbox disabled indeterminate label="Devre dışı, kısmen" />
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Checkbox skeleton={isLoading} defaultChecked label="Konum" description="Yakındaki mağazaları göstermek için" />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View>
          <Checkbox skeleton={skeleton} defaultChecked label="Konum" description="Yakındaki mağazaları göstermek için" />
          <Checkbox skeleton={skeleton} label="Kişiler" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
