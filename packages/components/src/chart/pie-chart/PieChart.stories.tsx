/**
 * Faz 16.9: gerçek senaryolar — trafik kaynakları (halka, toplam ortada),
 * cihaz payı (pasta), "Diğer"e katlama. "Show code" `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../../lib/SkeletonDemo";
import { Card } from "../../card";
import { PieChart } from "./PieChart";
import { deviceShare, trafficSources } from "../storyData";

const meta: Meta<typeof PieChart> = {
  title: "Veri Gösterimi/PieChart",
  component: PieChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Pasta / halka grafiği — bir bütünün az sayıda parçası. Dilimler arasında 2px yüzey boşluğu; üzerine gelince " +
            "dilim dışa çıkar, tooltip ad, değer ve yüzde gösterir. Lejant her zaman var, yüzdeler lejantta. `maxSlices`'tan " +
            "fazla dilim \"Diğer\"de toplanır (palet döngüye girmez). `donut` ortada toplamı gösterir.",
          whenToUse: ["Bir bütünün 2–6 parçası (cihaz payı, trafik kaynağı).", "Tek bir oranı öne çıkarmak — `donut` + `centerValue`."],
          whenNotToUse: [
            "Parçaları birbiriyle hassas karşılaştırmak — BarChart (açıları göz zor karşılaştırır).",
            "6'dan fazla parça — yatay BarChart.",
            "Zaman içinde değişim — LineChart.",
          ],
          a11y: "Görünmez tablo ad, değer ve oranı taşır. Çizim alanı odaklanabilir; ok tuşları dilimleri gezer.",
        }),
      },
    },
  },
  argTypes: {
    donut: { control: "boolean" },
    maxSlices: { control: { type: "number", min: 2, max: 8 } },
    showPercent: { control: "boolean" },
    skeleton: { control: "boolean" },
    data: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PieChart>;

export const Playground: Story = {
  args: { label: "Trafik kaynakları", data: trafficSources, donut: true, maxSlices: 6, showPercent: true, skeleton: false },
  render: (args) => <PieChart {...args} className="h-80 max-w-sm" />,
};

export const TrafficSources: Story = {
  name: "Halka — Trafik Kaynakları",
  ...storyDoc(
    "`donut`: ortada toplam ziyaret. Lejant altta, yüzdelerle.",
    `<PieChart label="Trafik kaynakları, Eylül" data={sources} donut centerLabel="Ziyaret" className="h-80" />`
  ),
  render: () => (
    <Card title="Trafik kaynakları" extra="Eylül" className="max-w-sm">
      <PieChart label="Trafik kaynakları, Eylül" data={trafficSources} donut centerLabel="Ziyaret" className="h-80" />
    </Card>
  ),
};

export const DeviceShare: Story = {
  name: "Pasta — Cihaz Payı",
  ...storyDoc(
    "Üç parça: paletin ilk üç rengi tüm çiftlerde renk körlüğüne göre doğrulanmış — en güvenli durum.",
    `<PieChart label="Cihaza göre oturum payı (%)" data={[{ name: "Mobil", value: 62 }, { name: "Masaüstü", value: 31 }, { name: "Tablet", value: 7 }]} valueFormatter={(v) => \`%\${v}\`} />`
  ),
  render: () => (
    <Card title="Cihaz payı" className="max-w-sm">
      <PieChart label="Cihaza göre oturum payı (%)" data={deviceShare} valueFormatter={(v) => `%${v}`} className="h-72" />
    </Card>
  ),
};

const manyCategories = [
  { name: "Elektronik", value: 3200 },
  { name: "Giyim", value: 2400 },
  { name: "Ev ve yaşam", value: 1800 },
  { name: "Kitap", value: 900 },
  { name: "Spor", value: 650 },
  { name: "Oyuncak", value: 420 },
  { name: "Kozmetik", value: 380 },
  { name: "Bahçe", value: 210 },
];

export const OtherBucket: Story = {
  name: "\"Diğer\"e Katlama",
  ...storyDoc(
    "8 kategori, `maxSlices={5}`: ilk 4 ayrı, kalanı \"Diğer\" diliminde toplanır.",
    `<PieChart label="Kategoriye göre satış" data={categories} maxSlices={5} donut />`
  ),
  render: () => (
    <Card title="Kategoriye göre satış" className="max-w-sm">
      <PieChart label="Kategoriye göre satış" data={manyCategories} maxSlices={5} donut className="h-80" />
    </Card>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<PieChart label="Trafik" data={data ?? []} donut skeleton={isLoading} />`),
  render: () => <SkeletonDemo className="w-full max-w-sm">{(skeleton) => <PieChart label="Trafik" data={trafficSources} donut skeleton={skeleton} className="h-80" />}</SkeletonDemo>,
};
