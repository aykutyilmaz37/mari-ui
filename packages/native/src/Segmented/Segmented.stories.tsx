import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { LayoutGrid, List as ListIcon } from "lucide-react-native";
import { Segmented, type SegmentedValue } from "./Segmented";
import { Badge } from "../Badge";
import { Text, Title } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Segmented> = {
  title: "Native/Veri Girişi/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "2–5 kısa seçenekten biri; görünümü ya da süzgeci anında değiştirir.",
    whenToUse: ["Grafik dönemi (Gün/Hafta/Ay).", "Liste/ızgara görünümü.", "Aylık/Yıllık fiyat."],
    whenNotToUse: ["Uzun ya da çok seçenek — RadioGroup / Select.", "İçerik sekmeleri — Tabs."],
    vsWeb: "Prop'lar aynı (`aria-label` → `accessibilityLabel`). Görünüm iOS UISegmentedControl: md 32pt, seçili yüzey kayarak geçer (hareket azaltmada anlık); dokunma alanı `hitSlop` ile 44. Yalnız ikonlu seçeneğe `accessibilityLabel` verin.",
  }) } } },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { size: "md", block: false, disabled: false, skeleton: false, accessibilityLabel: "Dönem" },
};
export default meta;
type Story = StoryObj<typeof Segmented>;

export const Playground: Story = {
  ...storyDoc("Boyut, tam genişlik ve devre dışını deneyin."),
  render: (args) => <Segmented {...args} options={["Gün", "Hafta", "Ay", "Yıl"]} />,
};

const SALES: Record<string, string> = { Gün: "₺12.480", Hafta: "₺86.210", Ay: "₺342.900" };

function ChartPeriod() {
  const [period, setPeriod] = useState<SegmentedValue>("Hafta");
  return (
    <View style={{ alignSelf: "stretch", gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Title level={5}>Satışlar</Title>
        <Segmented size="sm" accessibilityLabel="Dönem" value={period} onChange={setPeriod} options={["Gün", "Hafta", "Ay"]} />
      </View>
      <Title level={2}>{SALES[String(period)]}</Title>
      <Text muted>{`Seçili dönem: ${period}`}</Text>
    </View>
  );
}

export const Period: Story = {
  name: "Grafik Dönemi",
  ...storyDoc("Kart başlığında küçük (`sm`) seçici; değer anında değişir.", `<Segmented size="sm" accessibilityLabel="Dönem" value={period} onChange={setPeriod} options={["Gün", "Hafta", "Ay"]} />`),
  render: () => <ChartPeriod />,
};

function ViewSwitch() {
  const theme = useTheme();
  const muted = theme.color.canvas.muted;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", alignSelf: "stretch" }}>
      <Text weight="medium">128 ürün</Text>
      <Segmented
        accessibilityLabel="Görünüm"
        options={[
          { value: "grid", icon: <LayoutGrid size={16} color={muted} />, accessibilityLabel: "Izgara" },
          { value: "list", icon: <ListIcon size={16} color={muted} />, accessibilityLabel: "Liste" },
        ]}
      />
    </View>
  );
}

export const ViewSwitcher: Story = {
  name: "Görünüm Değiştirici (Araç Çubuğu)",
  ...storyDoc("Yalnız ikonlu seçenekler; her birinin erişilebilir adı var.", `<Segmented accessibilityLabel="Görünüm" options={[
  { value: "grid", icon: <LayoutGrid size={16} />, accessibilityLabel: "Izgara" },
  { value: "list", icon: <List size={16} />, accessibilityLabel: "Liste" },
]} />`),
  render: () => <ViewSwitch />,
};

function Billing() {
  const [cycle, setCycle] = useState<SegmentedValue>("yearly");
  return (
    <View style={{ alignSelf: "stretch", gap: 12 }}>
      <Segmented
        block
        accessibilityLabel="Ödeme dönemi"
        value={cycle}
        onChange={setCycle}
        options={[
          { value: "monthly", label: "Aylık" },
          { value: "yearly", label: "Yıllık" },
        ]}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Title level={3}>{cycle === "yearly" ? "₺1.490 / yıl" : "₺149 / ay"}</Title>
        {cycle === "yearly" ? <Badge count="%17 indirim" color="success" /> : null}
      </View>
    </View>
  );
}

export const BillingCycle: Story = {
  name: "Aylık / Yıllık (block)",
  ...storyDoc("`block`: tam genişlik, eşit bölmeler.", `<Segmented block accessibilityLabel="Ödeme dönemi" value={cycle} onChange={setCycle} options={[{ value: "monthly", label: "Aylık" }, { value: "yearly", label: "Yıllık" }]} />`),
  render: () => <Billing />,
};

export const SizesAndStates: Story = {
  name: "Boyutlar ve Durumlar",
  ...storyDoc("sm 28 · md 32 · lg 40; tek seçenek ya da tümü devre dışı.", `<Segmented size="lg" options={["Gün", "Hafta", "Ay"]} />
<Segmented options={[{ value: "std", label: "Standart" }, { value: "fast", label: "Hızlı", disabled: true }]} />
<Segmented disabled options={["Açık", "Kapalı"]} />`),
  render: () => (
    <Stack>
      {(["sm", "md", "lg"] as const).map((size) => <Segmented key={size} size={size} accessibilityLabel={size} options={["Gün", "Hafta", "Ay"]} />)}
      <Segmented accessibilityLabel="Teslimat" options={[{ value: "std", label: "Standart" }, { value: "fast", label: "Hızlı", disabled: true }]} />
      <Segmented disabled accessibilityLabel="Kilitli" options={["Açık", "Kapalı"]} />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Segmented skeleton={isLoading} options={["Gün", "Hafta", "Ay"]} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Segmented skeleton={skeleton} accessibilityLabel="Dönem" options={["Gün", "Hafta", "Ay"]} />}</SkeletonDemo>,
};
