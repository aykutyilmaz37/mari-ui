/**
 * Faz 16.9: gerçek senaryolar — KPI kartında eğilim, tablo satırında mini
 * grafik. "Show code" `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../../lib/SkeletonDemo";
import { Card } from "../../card";
import { Statistic } from "../../statistic";
import { Sparkline } from "./Sparkline";

const meta: Meta<typeof Sparkline> = {
  title: "Veri Gösterimi/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Eksensiz mini çizgi — bir değerin yanında eğilimi gösterir. Varsayılan soluk çizgi + vurgulu son nokta: kartın " +
            "asıl değeri öne çıksın. Ekseni ve tooltip'i yoktur; değeri yanındaki sayı taşır.",
          whenToUse: ["Statistic/KPI kartında son 12 dönemin eğilimi.", "Tablo satırında her kaydın kısa geçmişi."],
          whenNotToUse: ["Değerlerin okunması gerekiyorsa — LineChart (eksen + tooltip)."],
          a11y: "`label` verilirse `role=\"img\"` ve eğilimi anlatan metin; verilmezse dekoratif (`aria-hidden`).",
        }),
      },
    },
  },
  argTypes: {
    color: { control: "select", options: ["muted", "primary", "success", "error", 1, 2, 3] },
    area: { control: "boolean" },
    curve: { control: "inline-radio", options: ["linear", "smooth"] },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Sparkline>;

const revenue = [182, 195, 214, 201, 236, 258, 249, 271, 289, 312, 334, 361];
const churn = [4.1, 4.3, 4.0, 4.6, 4.9, 5.2, 5.0, 5.6, 5.9, 6.1, 6.4, 6.8];

export const Playground: Story = {
  args: { data: revenue, color: "muted", area: false, curve: "smooth", skeleton: false, label: "Son 12 ay gelir, yükselişte" },
  render: (args) => <Sparkline {...args} className="h-10 w-48" />,
};

export const KpiCards: Story = {
  name: "KPI Kartları",
  ...storyDoc(
    "Statistic + Sparkline: değer ve trend kartın başında, eğilim altta. Kayıp oranı kötüye gidiyor: son noktayı `error` yapmak " +
      "anlamı renkle değil, trend okuyla birlikte destekler.",
    `
<Card>
  <Statistic title="Aylık gelir" value={361000} prefix="₺" trend={{ value: 8.1, goodWhen: "up" }} />
  <Sparkline data={revenue} label="Son 12 ay gelir, yükselişte" area className="mt-3 h-10" />
</Card>`
  ),
  render: () => (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Card>
        <Statistic title="Aylık gelir" value={361000} prefix="₺" trend={{ value: 8.1, goodWhen: "up" }} description="geçen aya göre" />
        <Sparkline data={revenue} label="Son 12 ay gelir, yükselişte" area className="mt-3 h-10" />
      </Card>
      <Card>
        <Statistic title="Kayıp oranı" value={6.8} suffix="%" precision={1} trend={{ value: 0.4, goodWhen: "down", unit: "points" }} description="geçen aya göre" />
        <Sparkline data={churn} label="Son 12 ay kayıp oranı, artışta" endColor="error" area className="mt-3 h-10" />
      </Card>
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Sparkline data={data ?? []} skeleton={isLoading} className="h-10 w-48" />`),
  render: () => <SkeletonDemo>{(skeleton) => <Sparkline data={revenue} skeleton={skeleton} className="h-10 w-48" />}</SkeletonDemo>,
};
