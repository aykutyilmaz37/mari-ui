/**
 * Faz 16.9: gerçek senaryolar — sunucu doluluğu (eşikli), satış hedefi,
 * müşteri memnuniyeti. "Show code" `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../../lib/SkeletonDemo";
import { ANIMATION_STORY_DOC, AnimationDemo } from "../../lib/AnimationDemo";
import { EMPTY_STORY_DOC } from "../_shared/storyDocs";
import { Card } from "../../card";
import { Gauge, type GaugeSegment } from "./Gauge";

const meta: Meta<typeof Gauge> = {
  title: "Veri Gösterimi/Charts/Gauge",
  component: Gauge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Gösterge — tek bir değerin bir aralıktaki yeri (270° yay). Dolgu durum rengini taşır, iz aynı rengin soluk " +
            "hali. `segments` ile eşiklere göre renk; durum adı (`label`) metin olarak da görünür, renk tek ipucu değil.",
          whenToUse: ["Doluluk, kapasite, hedefe ulaşma oranı, skor.", "Eşiklerin anlam taşıdığı tek değer (normal / uyarı / kritik)."],
          whenNotToUse: ["Birden çok değeri karşılaştırmak — BarChart.", "Zaman içinde değişim — LineChart.", "Doğrusal ilerleme (yükleme, adım) — Progress."],
          a11y: "`role=\"meter\"`: ad, min/max, değer ve durum (`aria-valuetext`) ekran okuyucuya okunur.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    color: { control: "select", options: ["primary", "accent", "success", "warning", "error", "info", "neutral", 1, 2, 3, 4] },
    hideLabel: { control: "boolean" },
    skeleton: { control: "boolean" },
    segments: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Gauge>;

export const Playground: Story = {
  args: { value: 68, min: 0, max: 100, label: "Disk doluluğu", color: "primary", hideLabel: false, skeleton: false, animated: true },
};

const capacity: GaugeSegment[] = [
  { upTo: 70, color: "success", label: "Normal" },
  { upTo: 90, color: "warning", label: "Yüksek" },
  { upTo: 100, color: "error", label: "Kritik" },
];

export const Thresholds: Story = {
  name: "Eşikli — Sunucu Doluluğu",
  ...storyDoc(
    "`segments`: değer hangi eşiğin altındaysa o rengi alır; durum adı göstergenin altında ve ekran okuyucuda.",
    `
const segments = [
  { upTo: 70, color: "success", label: "Normal" },
  { upTo: 90, color: "warning", label: "Yüksek" },
  { upTo: 100, color: "error", label: "Kritik" },
];

<Gauge label="CPU" value={42} segments={segments} valueFormatter={(v) => \`%\${v}\`} />
<Gauge label="Bellek" value={81} segments={segments} valueFormatter={(v) => \`%\${v}\`} />
<Gauge label="Disk" value={96} segments={segments} valueFormatter={(v) => \`%\${v}\`} />`
  ),
  render: () => (
    <Card title="Sunucu durumu" extra="api-01" className="max-w-2xl">
      <div className="flex flex-wrap justify-around gap-6">
        {[
          { label: "CPU", value: 42 },
          { label: "Bellek", value: 81 },
          { label: "Disk", value: 96 },
        ].map((g) => (
          <Gauge key={g.label} label={g.label} value={g.value} segments={capacity} valueFormatter={(v) => `%${v}`} className="w-40" />
        ))}
      </div>
    </Card>
  ),
};

const tryCompact = (v: number) => new Intl.NumberFormat("tr-TR", { notation: "compact", style: "currency", currency: "TRY", maximumFractionDigits: 1 }).format(v);

export const SalesTarget: Story = {
  name: "Satış Hedefi",
  ...storyDoc(
    "Para birimiyle: min/max uç etiketleri de aynı biçimde.",
    `<Gauge label="Ekim satış hedefi" value={2_840_000} max={3_500_000} valueFormatter={(v) => formatCompactTRY(v)} />`
  ),
  render: () => (
    <Card title="Ekim" className="max-w-xs">
      <div className="flex justify-center">
        <Gauge label="Satış hedefi" value={2_840_000} max={3_500_000} valueFormatter={tryCompact} />
      </div>
    </Card>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Gauge label="Disk" value={data?.disk ?? 0} skeleton={isLoading} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Gauge label="Disk doluluğu" value={68} skeleton={skeleton} />}</SkeletonDemo>,
};

export const Animation: Story = {
  name: "Animasyon",
  ...storyDoc(ANIMATION_STORY_DOC, `<Gauge label="Disk doluluğu" value={68} />`),
  render: () => (
    <AnimationDemo>
      <Gauge label="Disk doluluğu" value={68} />
    </AnimationDemo>
  ),
};

export const EmptyState: Story = {
  name: "Boş",
  ...storyDoc(EMPTY_STORY_DOC, `<Gauge label="Disk doluluğu" value={data?.disk ?? null} emptyText="Henüz ölçüm yok" />`),
  render: () => <Gauge label="Disk doluluğu" value={null} emptyText="Henüz ölçüm yok" />,
};
