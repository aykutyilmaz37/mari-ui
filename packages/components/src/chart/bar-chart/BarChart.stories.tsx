/**
 * Faz 16.9: gerçek senaryolar — kanal satışları (gruplu), destek talepleri
 * (yığılmış), bölge kârı (yatay, negatif). "Show code" `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../../lib/SkeletonDemo";
import { Card } from "../../card";
import { BarChart } from "./BarChart";
import { profitByRegion, salesByChannel, ticketsByStatus } from "../storyData";

type Row = (typeof salesByChannel)[number];

const meta: Meta<typeof BarChart<Row>> = {
  title: "Veri Gösterimi/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Çubuk grafiği — kategoriler arası büyüklük karşılaştırması. Dikey (sütun) ya da yatay; seriler yan yana " +
            "(gruplu) ya da üst üste (`stacked`). Çubuklar tek tabandan büyür, veri ucu yuvarlak, en fazla 1.5rem kalın; " +
            "dokunan çubukları çizgi değil 2px yüzey boşluğu ayırır. Negatif değerler sıfır çizgisinin altına iner.",
          whenToUse: [
            "Ürün, kanal, bölge gibi kategorileri karşılaştırmak.",
            "Uzun kategori adları ya da sıralama (en çoktan en aza) — `layout=\"horizontal\"`.",
            "Parça–bütün ilişkisini kategoriler boyunca göstermek — `stacked`.",
          ],
          whenNotToUse: ["Sürekli zaman serisi (30 gün, 12 ay eğilimi) — LineChart.", "Tek bütünün az sayıda parçası — PieChart."],
          a11y:
            "Görünmez veri tablosu her değeri taşır. Çizim alanı odaklanabilir; ok tuşları kategorileri gezer. Vuruş hedefi " +
            "tüm kategori bandı — ince çubuğa nişan almak gerekmez.",
        }),
      },
    },
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["vertical", "horizontal"] },
    stacked: { control: "boolean" },
    showGrid: { control: "boolean" },
    showLegend: { control: "boolean" },
    skeleton: { control: "boolean" },
    data: { control: false },
    series: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof BarChart<Row>>;

export const Playground: Story = {
  args: {
    label: "Kanala göre satış (adet)",
    data: salesByChannel,
    xKey: "kanal",
    series: [
      { key: "2025", name: "2025" },
      { key: "2026", name: "2026" },
    ],
    layout: "vertical",
    stacked: false,
    showGrid: true,
    skeleton: false,
  },
  render: (args) => <BarChart<Row> {...args} className="h-72" />,
};

export const Grouped: Story = {
  name: "Gruplu — Yıllara Göre Kanal",
  ...storyDoc(
    "İki yıl yan yana: her kanalda iki çubuk, aralarında 2px boşluk. Tooltip o kanaldaki iki yılı birlikte gösterir.",
    `
<BarChart
  label="Kanala göre satış, 2025 ve 2026"
  data={sales}
  xKey="kanal"
  series={[
    { key: "2025", name: "2025" },
    { key: "2026", name: "2026" },
  ]}
/>`
  ),
  render: () => (
    <Card title="Kanala göre satış" extra="adet" className="max-w-2xl">
      <BarChart<Row>
        label="Kanala göre satış, 2025 ve 2026"
        data={salesByChannel}
        xKey="kanal"
        series={[
          { key: "2025", name: "2025" },
          { key: "2026", name: "2026" },
        ]}
      />
    </Card>
  ),
};

type TicketRow = (typeof ticketsByStatus)[number];

export const Stacked: Story = {
  name: "Yığılmış — Destek Talepleri",
  ...storyDoc(
    "`stacked`: haftanın toplam talebi ve dağılımı birlikte. Yalnız en üst parçanın ucu yuvarlak; parçaları 2px boşluk " +
      "ayırır. \"Açık\" anlam taşıdığı için `color: \"warning\"` — anlamı olmayan seriler paletten.",
    `
<BarChart
  label="Haftalık destek talepleri"
  data={tickets}
  xKey="hafta"
  stacked
  series={[
    { key: "cozuldu", name: "Çözüldü" },
    { key: "acik", name: "Açık", color: "warning" },
    { key: "iptal", name: "İptal", color: "neutral" },
  ]}
/>`
  ),
  render: () => (
    <Card title="Destek talepleri" extra="Eylül" className="max-w-2xl">
      <BarChart<TicketRow>
        label="Haftalık destek talepleri"
        data={ticketsByStatus}
        xKey="hafta"
        stacked
        series={[
          { key: "cozuldu", name: "Çözüldü" },
          { key: "acik", name: "Açık", color: "warning" },
          { key: "iptal", name: "İptal", color: "neutral" },
        ]}
      />
    </Card>
  ),
};

type ProfitRow = (typeof profitByRegion)[number];

export const HorizontalNegative: Story = {
  name: "Yatay — Bölge Kârı (Negatif)",
  ...storyDoc(
    "`layout=\"horizontal\"`: uzun bölge adları solda okunur. Zarar eden bölgeler sıfır çizgisinin soluna uzanır; tek " +
      "seri olduğu için lejant yok.",
    `<BarChart label="Bölgeye göre kâr (bin ₺)" layout="horizontal" data={profit} xKey="bolge" series={[{ key: "kar", name: "Kâr" }]} />`
  ),
  render: () => (
    <Card title="Bölgeye göre kâr" extra="bin ₺" className="max-w-2xl">
      <BarChart<ProfitRow> label="Bölgeye göre kâr (bin ₺)" layout="horizontal" data={profitByRegion} xKey="bolge" series={[{ key: "kar", name: "Kâr" }]} className="h-72" />
    </Card>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<BarChart label="Satış" data={data ?? []} xKey="kanal" series={series} skeleton={isLoading} />`),
  render: () => (
    <SkeletonDemo className="w-full max-w-2xl">
      {(skeleton) => <BarChart<Row> label="Satış" data={salesByChannel} xKey="kanal" series={[{ key: "2026", name: "2026" }]} skeleton={skeleton} />}
    </SkeletonDemo>
  ),
};
