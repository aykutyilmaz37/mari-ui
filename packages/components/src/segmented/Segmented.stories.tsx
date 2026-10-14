/**
 * Faz 16.1: gerçek senaryolar — grafik dönemi, liste/kart görünüm
 * değiştirici (ikonlu), fiyatlandırma aylık/yıllık. "Show code" her story'de
 * `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kod. Story seviyesinde
 * `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LayoutGridIcon, ListIcon, TableIcon } from "lucide-react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Segmented } from "./Segmented";
import type { SegmentedValue } from "./types";
import { Input } from "../input";
import { Select } from "../select";

const meta: Meta<typeof Segmented> = {
  title: "Veri Girişi/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "2–5 seçenek arasından tek bir DEĞER seçtiren, hepsini aynı anda gösteren kontrol (Gün/Hafta/Ay, Liste/Kart). " +
            "Görünüm Tabs'in `pills`iyle aynı; seçili dilimin zemini kayarak geçer. Yüksekliği Input/Select ile aynı — " +
            "bir araç çubuğunda yan yana hizalı durur. `block` tam genişlik, eşit dilimler.",
          whenToUse: [
            "Görünümü ya da filtreyi hemen değiştiren kısa seçimler (grafik dönemi, görünüm tipi, aylık/yıllık).",
            "Seçeneklerin hepsinin görünmesi karar vermeyi kolaylaştırıyorsa (Select'te gizli kalırdı).",
          ],
          whenNotToUse: [
            "Her seçenek ayrı bir İÇERİK paneli açıyorsa — Tabs (anlamı farklı: panel değiştirir).",
            "5'ten fazla ya da uzun etiketli seçenek — Select ya da RadioGroup.",
          ],
          a11y:
            "Gerçek radyo düğmeleri + `role=\"radiogroup\"` (adı `aria-label`/`aria-labelledby`). Tab gruba tek durakla " +
            "girer, ok tuşları seçimi taşır, disabled seçenek atlanır, `name` ile native forma katılır. Yalnız ikonlu " +
            "seçenekte `aria-label` zorunlu. Hareket azaltma tercihinde zemin kaymaz.",
        }),
      },
    },
  },
  argTypes: {
    options: { control: false },
    value: { control: false },
    defaultValue: { control: "text" },
    onChange: { table: { category: "Olaylar" } },
    block: { control: "boolean", description: "Tam genişlik, eşit dilimler." },
    size: baseSizeArgType,
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof Segmented>;

/* ─────────────────────────── 1. Grafik dönemi ─────────────────────────── */

const series: Record<string, number[]> = {
  Gün: [12, 18, 9, 22, 30, 26, 14],
  Hafta: [80, 95, 70, 110, 128, 102, 90],
  Ay: [320, 410, 380, 460, 520, 490, 540],
  Yıl: [3800, 4200, 4600, 5100, 5600, 6100, 6400],
};

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { "aria-label": "Dönem", options: ["Gün", "Hafta", "Ay", "Yıl"], block: false, size: "md", disabled: false, skeleton: false },
  render: (args) => (
    <div className="max-w-md">
      <Segmented {...args} />
    </div>
  ),
};

export const ChartPeriod: Story = {
  name: "Grafik Dönemi",
  ...storyDoc(
    "Seçim anında görünümü değiştirir; başlığın yanında, grafiğin üstünde. Başlık grubun adıdır (`aria-labelledby`).",
    `<Segmented aria-labelledby="sales-title" options={["Gün", "Hafta", "Ay", "Yıl"]} value={period} onChange={setPeriod} />`
  ),
  render: () => {
    const [period, setPeriod] = useState<SegmentedValue>("Hafta");
    const data = series[String(period)]!;
    const max = Math.max(...data);
    return (
      <div className="max-w-lg rounded-xl border border-mari-border bg-mari-surface p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 id="sales-title" className="text-sm font-semibold text-mari-foreground">
            Satışlar
          </h3>
          <Segmented aria-labelledby="sales-title" size="sm" options={Object.keys(series)} value={period} onChange={setPeriod} />
        </div>
        <div className="flex h-32 items-end gap-2" aria-hidden>
          {data.map((v, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-mari-primary/70 transition-[height] duration-300" style={{ height: `${(v / max) * 100}%` }} />
          ))}
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Görünüm değiştirici ─────────────────────────── */

export const ViewSwitcher: Story = {
  name: "Görünüm Değiştirici (Araç Çubuğu)",
  ...storyDoc(
    "Yalnız ikonlu dilimler `aria-label` taşır. Yüksekliği Input ve Select ile aynı (md: 32px) — araç çubuğunda aynı hizada.",
    `
<Segmented
  aria-label="Görünüm"
  options={[
    { value: "list", icon: <ListIcon />, "aria-label": "Liste" },
    { value: "grid", icon: <LayoutGridIcon />, "aria-label": "Kart" },
    { value: "table", icon: <TableIcon />, "aria-label": "Tablo" },
  ]}
/>`
  ),
  render: () => (
    <div className="flex max-w-2xl flex-wrap items-center gap-2">
      <Input aria-label="Ürün ara" placeholder="Ürün ara" className="w-48 flex-1" />
      <div className="w-40">
        <Select aria-label="Sırala" defaultValue="new" options={[{ value: "new", label: "En yeni" }, { value: "price", label: "Fiyat" }]} />
      </div>
      <Segmented
        aria-label="Görünüm"
        defaultValue="grid"
        options={[
          { value: "list", icon: <ListIcon />, "aria-label": "Liste" },
          { value: "grid", icon: <LayoutGridIcon />, "aria-label": "Kart" },
          { value: "table", icon: <TableIcon />, "aria-label": "Tablo" },
        ]}
      />
    </div>
  ),
};

/* ─────────────────────────── 3. Fiyatlandırma ─────────────────────────── */

export const BillingCycle: Story = {
  name: "Aylık / Yıllık (block)",
  ...storyDoc(
    "`block`: tam genişlik, eşit dilimler — mobil fiyatlandırma kartında. Etikette rozet gibi ek içerik olabilir.",
    `<Segmented block size="lg" aria-label="Faturalama" options={[{ value: "monthly", label: "Aylık" }, { value: "yearly", label: <>Yıllık <span>%20 indirim</span></> }]} />`
  ),
  render: () => {
    const [cycle, setCycle] = useState<SegmentedValue>("yearly");
    return (
      <div className="max-w-sm space-y-4 rounded-xl border border-mari-border bg-mari-surface p-5">
        <Segmented
          block
          size="lg"
          aria-label="Faturalama"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Aylık" },
            {
              value: "yearly",
              label: (
                <>
                  Yıllık <span className="ml-1 rounded-full bg-mari-success-subtle px-1.5 text-xs text-mari-success-subtle-contrast">%20</span>
                </>
              ),
            },
          ]}
        />
        <p className="text-3xl font-semibold tabular-nums text-mari-foreground">
          {cycle === "yearly" ? "239 ₺" : "299 ₺"}
          <span className="ml-1 text-sm font-normal text-mari-muted">/ ay</span>
        </p>
      </div>
    );
  },
};

export const Appearance: Story = {
  name: "Boyutlar ve Durumlar",
  ...storyDoc("sm / md / lg (24 / 32 / 40px), devre dışı seçenek, tümü devre dışı, iskelet.", `
<Segmented size="sm" aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} defaultValue="Hafta" />
<Segmented size="md" aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} defaultValue="Hafta" />
<Segmented size="lg" aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} defaultValue="Hafta" />
<Segmented aria-label="Plan" options={[{ value: "free", label: "Ücretsiz" }, { value: "pro", label: "Pro", disabled: true }, { value: "team", label: "Ekip" }]} />
<Segmented aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} disabled />`),
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Segmented key={size} size={size} aria-label={`Dönem (${size})`} options={["Gün", "Hafta", "Ay"]} defaultValue="Hafta" />
      ))}
      <Segmented aria-label="Plan" options={[{ value: "free", label: "Ücretsiz" }, { value: "pro", label: "Pro", disabled: true }, { value: "team", label: "Ekip" }]} />
      <Segmented aria-label="Dönem (devre dışı)" options={["Gün", "Hafta", "Ay"]} disabled />
          </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Segmented aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <Segmented aria-label="Dönem" options={["Gün", "Hafta", "Ay", "Yıl"]} skeleton={skeleton} />}</SkeletonDemo>,
};
