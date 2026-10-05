/**
 * Faz 16.9: gerçek senaryolar — gelir/gider karşılaştırması, günlük ziyaret
 * (alan), eksik veri. "Show code" `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../../lib/SkeletonDemo";
import { Card } from "../../card";
import { LineChart } from "./LineChart";
import { dailyVisitors, monthlyRevenue, tryFormatter } from "../storyData";

type Row = (typeof monthlyRevenue)[number];

const meta: Meta<typeof LineChart<Row>> = {
  title: "Veri Gösterimi/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Çizgi ve alan grafiği — zaman ya da sıralı kategori boyunca değişim. Paket bağımlılığı yok (saf SVG). Renkler " +
            "renk körlüğüne göre doğrulanmış grafik paletinden (`--mari-color-chart-1…8`), koyu modda kendi tonlarıyla. " +
            "Üzerine gelince dikey kılavuz en yakın noktaya oturur, tooltip o noktadaki TÜM serileri gösterir. Yükseklik " +
            "`className` ile (varsayılan `h-64`, rem — yoğunluk ve büyük ekran ölçeğiyle büyür).",
          whenToUse: ["Aylık gelir, günlük ziyaret gibi zaman serileri.", "Birkaç serinin aynı zaman ekseninde karşılaştırılması (en fazla 4–5)."],
          whenNotToUse: [
            "Kategoriler arası büyüklük (ürün, bölge) — BarChart.",
            "Bir bütünün parçaları — PieChart.",
            "Tek bir güncel değer — Statistic (eğilim için Sparkline ile).",
            "İki farklı birimdeki ölçü (₺ ve %) — iki ayrı grafik; çift y ekseni yok.",
          ],
          a11y:
            "Grafik `figure` + görünmez veri tablosu: ekran okuyucu tüm değerlere tablo olarak ulaşır. Çizim alanı odaklanabilir; " +
            "ok tuşları/Home/End noktaları gezer, tooltip görünür. 2+ seride lejant her zaman var — kimlik yalnız renge kalmaz.",
        }),
      },
    },
  },
  argTypes: {
    curve: { control: "inline-radio", options: ["linear", "smooth"] },
    area: { control: "boolean" },
    includeZero: { control: "boolean" },
    showGrid: { control: "boolean" },
    showLegend: { control: "boolean" },
    skeleton: { control: "boolean" },
    data: { control: false },
    series: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof LineChart<Row>>;

export const Playground: Story = {
  args: {
    label: "Aylık gelir ve gider",
    data: monthlyRevenue,
    xKey: "month",
    series: [
      { key: "gelir", name: "Gelir" },
      { key: "gider", name: "Gider" },
    ],
    curve: "linear",
    area: false,
    showGrid: true,
    skeleton: false,
  },
  render: (args) => <LineChart<Row> {...args} className="h-72" />,
};

export const RevenueVsCost: Story = {
  name: "Gelir — Gider — Hedef",
  ...storyDoc(
    "Pano kartı: üç seri, lejant üstte, değerler ₺ biçiminde (eksen kısaltılmış: 250 B). Hedef serisinin rengi paletin " +
      "3. rengi — renkler seriye bağlı, sırasına değil.",
    `
<Card title="Gelir ve gider" extra="2026">
  <LineChart
    label="Aylık gelir, gider ve hedef"
    data={monthly}
    xKey="month"
    series={[
      { key: "gelir", name: "Gelir" },
      { key: "gider", name: "Gider" },
      { key: "hedef", name: "Hedef" },
    ]}
    valueFormatter={(v) => formatTRY(v)}
    curve="smooth"
    className="h-72"
  />
</Card>`
  ),
  render: () => (
    <Card title="Gelir ve gider" extra="2026" className="max-w-3xl">
      <LineChart<Row>
        label="Aylık gelir, gider ve hedef"
        data={monthlyRevenue}
        xKey="month"
        series={[
          { key: "gelir", name: "Gelir" },
          { key: "gider", name: "Gider" },
          { key: "hedef", name: "Hedef" },
        ]}
        valueFormatter={tryFormatter}
        curve="smooth"
        className="h-72"
      />
    </Card>
  ),
};

export const DailyVisitors: Story = {
  name: "Alan — Günlük Ziyaret",
  ...storyDoc(
    "Tek seri, `area`: lejant yok (başlık seriyi zaten adlandırıyor), alan %10 dolgu. 30 günde x etiketleri sığdığı kadar " +
      "seyreltilir; tooltip her güne ulaşır.",
    `<LineChart label="Eylül, günlük ziyaret" data={daily} xKey="day" series={[{ key: "ziyaret", name: "Ziyaret" }]} area curve="smooth" />`
  ),
  render: () => (
    <Card title="Günlük ziyaret" extra="Eylül" className="max-w-3xl">
      <LineChart label="Eylül, günlük ziyaret" data={dailyVisitors} xKey="day" series={[{ key: "ziyaret", name: "Ziyaret" }]} area curve="smooth" />
    </Card>
  ),
};

const withGaps = monthlyRevenue.map((r, i) => ({ ...r, gelir: i === 4 || i === 5 ? null : r.gelir }));

export const MissingData: Story = {
  name: "Eksik Veri",
  ...storyDoc(
    "`null` değer çizgiyi böler — veri yokken çizgi uydurulmaz. Tooltip ve tabloda \"—\".",
    `<LineChart label="Gelir (Mayıs–Haziran verisi yok)" data={rows} xKey="month" series={[{ key: "gelir", name: "Gelir" }]} />`
  ),
  render: () => (
    <div className="max-w-3xl">
      <LineChart label="Gelir (Mayıs–Haziran verisi yok)" data={withGaps} xKey="month" series={[{ key: "gelir", name: "Gelir" }]} valueFormatter={tryFormatter} />
    </div>
  ),
};

export const EmptyState: Story = {
  name: "Boş",
  ...storyDoc("Veri yokken `Empty` çizilir; metin `emptyText` ile.", `<LineChart label="Gelir" data={[]} xKey="month" series={series} emptyText="Bu dönem için kayıt yok" />`),
  render: () => (
    <div className="max-w-3xl">
      <LineChart<Row> label="Gelir" data={[]} xKey="month" series={[{ key: "gelir", name: "Gelir" }]} emptyText="Bu dönem için kayıt yok" />
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<LineChart label="Gelir" data={data ?? []} xKey="month" series={series} skeleton={isLoading} />`),
  render: () => (
    <SkeletonDemo className="w-full max-w-3xl">
      {(skeleton) => <LineChart<Row> label="Gelir" data={monthlyRevenue} xKey="month" series={[{ key: "gelir", name: "Gelir" }]} skeleton={skeleton} />}
    </SkeletonDemo>
  ),
};
