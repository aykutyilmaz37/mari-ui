/**
 * Faz 16.5: gerçek senaryolar — doğum tarihi (yazarak giriş), otel
 * rezervasyonu (aralık + hazır seçimler), toplantı (tarih-saat, 15 dk adım),
 * çalışma saatleri (TimePicker aralık), rapor dönemi (ay/yıl), boyutlar.
 * Story seviyesinde `parameters` YAZMAYIN.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { addDays, addMonths, compareDay, formatDate, startOfDay, startOfMonth } from "../lib/date";
import { Field } from "../field";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import type { DateRangeValue } from "./types";
import { lastDays } from "./utils";

const meta: Meta<typeof DatePicker> = {
  title: "Veri Girişi/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "30rem" },
      description: {
        component: componentDoc({
          summary:
            "Tarih, saat ya da ikisini birlikte seçtiren alan. Tek motor (`mode=\"date\" | \"time\" | \"datetime\"`); " +
            "`TimePicker` saat modunun kısa adı. `range` başlangıç–bitiş (gün modunda iki aylık panel, üzerine gelince önizleme), " +
            "`picker=\"month\" | \"year\"` ay/yıl seçimi, `presets` hazır seçimler. Alan yazılabilir: `5/3/2026` → 05.03.2026. " +
            "Değer `Date`; bağımlılık yok (`Intl` ile Türkçe ay/gün adları).",
          whenToUse: ["Formda tek bir tarih/saat ya da aralık girişi.", "Rezervasyon, filtreleme (son 7 gün), randevu, vardiya saatleri."],
          whenNotToUse: ["Tarihe bağlı veriyi göstermek — Calendar (sayfada açık takvim).", "Yalnız yıl gibi çok kısa bir liste — Select de yeterli olabilir."],
          a11y:
            "APG Date Picker Combobox: alan `role=\"combobox\"` + `aria-haspopup=\"dialog\"`. Fareyle açılınca odak alanda kalır " +
            "(yazmaya devam edilebilir); ↓ odağı takvime ya da saat sütununa taşır. Takvim Calendar ile aynı APG ızgarası; saat " +
            "sütunları listbox (↑/↓, PageUp/Down 5'er). Escape taslağı atıp alana döner, Enter yazılanı uygular. Aralıkta alanlar " +
            "\"Başlangıç\"/\"Bitiş\" adlı, grup adı etiketten.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    presets: { control: false },
    disabledDate: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    onChange: { table: { category: "Olaylar" } },
    onOpenChange: { table: { category: "Olaylar" } },
    mode: { control: "inline-radio", options: ["date", "time", "datetime"] },
    picker: { control: "inline-radio", options: ["date", "month", "year"] },
    range: { control: "boolean" },
    size: baseSizeArgType,
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const today = startOfDay(new Date());

export const Playground: Story = { args: { "aria-label": "Tarih" } };

/* ─────────────────────────── 1. Doğum tarihi ─────────────────────────── */

export const BirthDate: Story = {
  name: "Doğum Tarihi (Yazarak)",
  ...storyDoc(
    "Uzak geçmiş bir tarihi takvimde aramak yerine yazmak daha hızlı: `14/5/1990` ya da `14.05.1990`. Başlıktaki yıla " +
      "tıklayınca yıl görünümü açılır. Gelecek tarihler `maxDate` ile kapalı.",
    `<Field label="Doğum tarihi" hint="gg.aa.yyyy">
  <DatePicker value={birth} onChange={setBirth} maxDate={today} />
</Field>`
  ),
  render: () => {
    const [birth, setBirth] = useState<Date | null>(null);
    const age = birth ? new Date(today.getTime() - birth.getTime()).getUTCFullYear() - 1970 : null;
    return (
      <div className="flex max-w-xs flex-col gap-2">
        <Field label="Doğum tarihi" hint="gg.aa.yyyy — yazabilir ya da takvimden seçebilirsiniz.">
          <DatePicker value={birth} onChange={setBirth} maxDate={today} />
        </Field>
        <p className="text-sm text-mari-muted" aria-live="polite">
          {age !== null ? `${age} yaşında` : " "}
        </p>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Rezervasyon ─────────────────────────── */

export const HotelBooking: Story = {
  name: "Otel Rezervasyonu (Aralık)",
  ...storyDoc(
    "`range`: giriş ve çıkış; iki aylık panel, çıkışı seçerken üzerine gelinen güne kadar önizleme. Geçmiş günler kapalı; " +
      "`presets` hafta sonu gibi kısayollar.",
    `<DatePicker range value={stay} onChange={setStay} minDate={today} rangeLabels={["Giriş", "Çıkış"]} presets={presets} />`
  ),
  render: () => {
    const [stay, setStay] = useState<DateRangeValue | null>(null);
    const nights = stay?.[0] && stay[1] ? compareDay(stay[1], stay[0]) / 86400000 : 0;
    const friday = addDays(today, (5 - today.getDay() + 7) % 7);
    return (
      <div className="flex max-w-md flex-col gap-2">
        <Field label="Konaklama tarihleri">
          <DatePicker
            range
            value={stay}
            onChange={setStay}
            minDate={today}
            rangeLabels={["Giriş", "Çıkış"]}
            placeholder={["Giriş", "Çıkış"]}
            presets={[
              { label: "Bu hafta sonu", value: [friday, addDays(friday, 2)] },
              { label: "1 hafta", value: () => [today, addDays(today, 7)] },
              { label: "2 hafta", value: () => [today, addDays(today, 14)] },
            ]}
          />
        </Field>
        <p className="text-sm text-mari-muted" aria-live="polite">
          {nights > 0 ? `${nights} gece · ${formatDate(stay![0]!, "d MMM")} – ${formatDate(stay![1]!, "d MMM yyyy")}` : "Tarih seçin."}
        </p>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Toplantı ─────────────────────────── */

export const Meeting: Story = {
  name: "Toplantı (Tarih ve Saat)",
  ...storyDoc(
    "`mode=\"datetime\"`: gün ve saat birlikte, \"Tamam\" ile uygulanır. `minuteStep={15}`; hafta sonu kapalı.",
    `<DatePicker mode="datetime" minuteStep={15} disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6} />`
  ),
  render: () => (
    <div className="max-w-xs">
      <Field label="Toplantı zamanı">
        <DatePicker mode="datetime" minuteStep={15} minDate={today} disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6} />
      </Field>
    </div>
  ),
};

/* ─────────────────────────── 4. Çalışma saatleri ─────────────────────────── */

export const WorkingHours: Story = {
  name: "Çalışma Saatleri (TimePicker)",
  ...storyDoc(
    "`TimePicker range`: açılış–kapanış. Saat sütunları klavyeyle de kullanılır (↓ ile sütuna geçin).",
    `<TimePicker range minuteStep={30} defaultValue={[nineAm, sixPm]} rangeLabels={["Açılış", "Kapanış"]} />`
  ),
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      {["Hafta içi", "Cumartesi"].map((day, i) => (
        <Field key={day} label={day}>
          <TimePicker
            range
            minuteStep={30}
            rangeLabels={["Açılış", "Kapanış"]}
            defaultValue={[new Date(2026, 0, 1, 9, 0), new Date(2026, 0, 1, i === 0 ? 18 : 14, 0)]}
          />
        </Field>
      ))}
    </div>
  ),
};

/* ─────────────────────────── 5. Ay / yıl ─────────────────────────── */

export const ReportPeriod: Story = {
  name: "Rapor Dönemi (Ay / Yıl)",
  ...storyDoc("`picker=\"month\"` ve `picker=\"year\"`: panel doğrudan ay ya da yıl ızgarasıyla açılır.", `<DatePicker picker="month" />\n<DatePicker picker="year" />`),
  render: () => (
    <div className="flex max-w-md flex-wrap gap-4">
      <Field label="Ay">
        <DatePicker picker="month" defaultValue={startOfMonth(today)} maxDate={today} />
      </Field>
      <Field label="Dönem (aylar)">
        <DatePicker picker="month" range defaultValue={[addMonths(startOfMonth(today), -2), startOfMonth(today)]} />
      </Field>
      <Field label="Yıl">
        <DatePicker picker="year" defaultValue={today} />
      </Field>
    </div>
  ),
};

/* ─────────────────────────── 6. Boyutlar ─────────────────────────── */

export const SizesAndStates: Story = {
  name: "Boyutlar ve Durumlar",
  ...storyDoc("Yükseklik Input/Select ile aynı. Devre dışı ve hata; filtre çubuğunda hazır aralık.", `<DatePicker size="sm" range presets={[{ label: "Son 7 gün", value: lastDays(7) }]} />`),
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <DatePicker key={size} size={size} aria-label={`Tarih (${size})`} defaultValue={today} />
      ))}
      <DatePicker range size="sm" aria-label="Filtre" presets={[{ label: "Son 7 gün", value: lastDays(7) }, { label: "Son 30 gün", value: lastDays(30) }]} />
      <DatePicker aria-label="Hatalı" color="error" />
      <DatePicker aria-label="Devre dışı" disabled defaultValue={today} />
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<DatePicker skeleton />
<DatePicker range skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => (
        <div className="flex max-w-md flex-col gap-3">
          <DatePicker aria-label="Tarih" defaultValue={today} skeleton={skeleton} />
          <DatePicker range aria-label="Aralık" defaultValue={[today, addDays(today, 3)]} skeleton={skeleton} />
        </div>
      )}</SkeletonDemo>,
};
