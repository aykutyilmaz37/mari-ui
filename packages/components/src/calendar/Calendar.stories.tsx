/**
 * Faz 16.5: gerçek senaryolar — ekip etkinlik takvimi (tam ekran +
 * cellRender), randevu günü seçimi (kart, hafta sonu/geçmiş kapalı, hafta
 * numarası), yıllık izin özeti (yıl modu). Story seviyesinde `parameters` YAZMAYIN.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { addDays, formatDate, isSameDay, startOfDay } from "../lib/date";
import { Field } from "../field";
import { Input } from "../input";
import { Modal } from "../modal";
import { Segmented } from "../segmented";
import { TimePicker } from "../date-picker";
import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Veri Gösterimi/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Ay ya da yıl görünümünde takvim. Tam ekran (varsayılan) hücrelere içerik koymaya uygundur (`cellRender`: " +
            "etkinlik, vardiya, not); `fullscreen={false}` kompakt kart. Başlıkta yıl/ay seçici ve Ay/Yıl modu. Türkçe ay ve " +
            "gün adları, Pazartesi başlangıç (`weekStart`), isteğe bağlı ISO hafta numarası. Bağımlılık yok (`Date` + `Intl`).",
          whenToUse: ["Tarihe bağlı veriyi takvim düzeninde göstermek (etkinlik, rezervasyon, izin).", "Sayfada sürekli açık duran bir gün seçimi."],
          whenNotToUse: ["Form alanında tarih girişi — DatePicker (açılır panel, yazarak giriş)."],
          a11y:
            "APG date grid: `role=\"grid\"`, sütun başlıkları tam gün adı, hücreler tam tarih adıyla (\"14 Ekim 2026 Çarşamba\"), " +
            "bugün `aria-current=\"date\"`, seçili `aria-selected`. Izgarada tek sekme durağı; ←/→ gün, ↑/↓ hafta, Home/End, " +
            "PageUp/Down ay (Shift ile yıl), Enter/Boşluk seçer. Ay değişince odak yeni aydaki güne taşınır.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    validRange: { control: false },
    cellRender: { control: false },
    disabledDate: { control: false },
    onChange: { table: { category: "Olaylar" } },
    onSelect: { table: { category: "Olaylar" } },
    onPanelChange: { table: { category: "Olaylar" } },
    fullscreen: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    mode: { control: "inline-radio", options: ["month", "year"] },
    weekStart: { control: "inline-radio", options: [1, 0] },
    showWeek: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Playground: Story = { args: { fullscreen: false } };

/* ─────────────────────────── 1. Etkinlik takvimi ─────────────────────────── */

const today = startOfDay(new Date());
const EVENTS = [
  { day: 0, title: "Sprint planlama", tone: "primary" },
  { day: 0, title: "Tasarım incelemesi", tone: "accent" },
  { day: 2, title: "Müşteri demosu", tone: "success" },
  { day: 5, title: "Sürüm 2.4", tone: "warning" },
  { day: 5, title: "Sürüm notları", tone: "primary" },
  { day: 5, title: "Retro", tone: "accent" },
  { day: 9, title: "Bakım penceresi", tone: "error" },
  { day: -3, title: "Ekip yemeği", tone: "success" },
].map((e) => ({ ...e, date: addDays(today, e.day) }));

const TONE: Record<string, string> = {
  primary: "bg-mari-primary-subtle text-mari-primary-subtle-contrast",
  accent: "bg-mari-accent-subtle text-mari-accent-subtle-contrast",
  success: "bg-mari-success-subtle text-mari-success-subtle-contrast",
  warning: "bg-mari-warning-subtle text-mari-warning-subtle-contrast",
  error: "bg-mari-error-subtle text-mari-error-subtle-contrast",
};

export const EventCalendar: Story = {
  name: "Ekip Etkinlik Takvimi",
  ...storyDoc(
    "Dar ekranda hücre içeriği bir noktaya iner (ekran okuyucu yine okur); ayrıntı yan panelde. " +
      "Tam ekran: `cellRender` hücreye etkinlikleri yazar — hücre sabit yükseklikte, en fazla 2 etkinlik + \"+N daha\". " +
      "Gün seçince yan panel o günün tamamını listeler. Ekran okuyucu hücreyi \"6 Ekim 2026 Salı, Sürüm 2.4…\" diye okur.",
    `<Calendar value={day} onChange={setDay} cellRender={(date, info) => info.type === "date" && <Events date={date} />} />`
  ),
  render: () => {
    const [day, setDay] = useState<Date | null>(today);
    const ofDay = (d: Date) => EVENTS.filter((e) => isSameDay(e.date, d));
    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Calendar
              value={day}
              onChange={setDay}
              cellRender={(date, info) =>
                info.type === "date" && ofDay(date).length > 0 ? (
                  <ul className="flex flex-col gap-0.5">
                    {ofDay(date)
                      .slice(0, 2)
                      .map((e) => (
                        <li key={e.title} className={`truncate rounded-sm px-1 py-0.5 ${TONE[e.tone]}`}>
                          {e.title}
                        </li>
                      ))}
                    {ofDay(date).length > 2 && <li className="px-1 text-mari-muted">+{ofDay(date).length - 2} daha</li>}
                  </ul>
                ) : null
              }
            />
        </div>
        <aside aria-live="polite" className="w-full shrink-0 rounded-lg border border-mari-border p-4 lg:w-64">
          <h3 className="mb-2 font-semibold">{day ? formatDate(day, "d MMMM, EEEE") : "Gün seçin"}</h3>
          {day && ofDay(day).length === 0 && <p className="text-sm text-mari-muted">Etkinlik yok.</p>}
          <ul className="flex flex-col gap-1 text-sm">
            {day &&
              ofDay(day).map((e) => (
                <li key={e.title} className={`rounded-md px-2 py-1 ${TONE[e.tone]}`}>
                  {e.title}
                </li>
              ))}
          </ul>
        </aside>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Randevu ─────────────────────────── */

export const Appointment: Story = {
  name: "Randevu Günü (Kart)",
  ...storyDoc(
    "`fullscreen={false}`: kompakt kart. Hafta sonu ve geçmiş günler `disabledDate` ile kapalı, `validRange` en fazla 2 ay " +
      "ileriyi açar (yıl listesi de buna göre). `showWeek` ISO hafta numarası.",
    `<Calendar fullscreen={false} showWeek disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6} validRange={[today, inTwoMonths]} onSelect={setDay} />`
  ),
  render: () => {
    const [day, setDay] = useState<Date | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <Calendar
          fullscreen={false}
          showWeek
          aria-label="Randevu takvimi"
          disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
          validRange={[today, addDays(today, 60)]}
          onSelect={(d) => setDay(d)}
        />
        <p className="text-sm text-mari-muted" aria-live="polite">
          {day ? `Seçilen: ${formatDate(day, "d MMMM yyyy, EEEE")}` : "Hafta içi bir gün seçin."}
        </p>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Yıllık izin ─────────────────────────── */

const LEAVE: Record<number, number> = { 0: 2, 3: 5, 6: 10, 7: 4, 11: 3 };

export const YearlyLeave: Story = {
  name: "Yıllık İzin Özeti (Yıl Modu)",
  ...storyDoc(
    "`defaultMode=\"year\"`: 12 ay; `cellRender` `info.type === \"month\"` hücrelerine özet yazar.",
    `<Calendar defaultMode="year" cellRender={(date, info) => info.type === "month" && \`\${leave[date.getMonth()]} gün\`} />`
  ),
  render: () => (
    <Calendar
      defaultMode="year"
      cellRender={(date, info) =>
        info.type === "month" && LEAVE[date.getMonth()] ? (
          <span className="rounded-sm bg-mari-success-subtle px-1.5 py-0.5 text-mari-success-subtle-contrast">{LEAVE[date.getMonth()]} gün izin</span>
        ) : null
      }
    />
  ),
};

/* ─────────────────────────── 4. Etkinlik ekleme ─────────────────────────── */

interface PlannedEvent {
  id: number;
  date: Date;
  title: string;
  start: Date;
  end: Date;
  tone: "primary" | "success" | "warning";
}

const TONE_OPTIONS = [
  { value: "primary", label: "Toplantı" },
  { value: "success", label: "Sosyal" },
  { value: "warning", label: "Son tarih" },
];

const at = (h: number, m = 0) => new Date(2026, 0, 1, h, m);

export const AddEvent: Story = {
  name: "Etkinlik Ekleme (Bileşim Örneği)",
  ...storyDoc(
    "Calendar etkinlik KAYDETMEZ — bu uygulamanın işi (alanlar, kayıt yeri, çakışma kuralı). Kalıp: `onSelect` gün seçimini " +
      "verir → Modal'da form (Input + TimePicker aralık + Segmented) → kaydedince etkinlik listenize eklenir, `cellRender` " +
      "onu hücreye çizer. Tam özellikli etkinlik takvimi (hafta/gün görünümü, sürükleme, tekrar) `@mari-ui/modules` kapsamındadır.",
    `const [draftDay, setDraftDay] = useState<Date | null>(null);

<Calendar onSelect={(date, { source }) => source === "date" && setDraftDay(date)} cellRender={(date) => <Events date={date} />} />
<Modal open={!!draftDay} title={\`Etkinlik ekle — \${formatDate(draftDay, "d MMMM")}\`} onConfirm={save} onClose={() => setDraftDay(null)}>
  <Field label="Başlık"><Input value={title} onChange={…} /></Field>
  <Field label="Saat"><TimePicker range minuteStep={15} value={time} onChange={setTime} /></Field>
  <Field label="Tür"><Segmented options={types} value={tone} onChange={setTone} /></Field>
</Modal>`
  ),
  render: () => {
    const [events, setEvents] = useState<PlannedEvent[]>([{ id: 1, date: addDays(today, 1), title: "Haftalık senkron", start: at(10), end: at(10, 30), tone: "primary" }]);
    const [draftDay, setDraftDay] = useState<Date | null>(null);
    const [title, setTitle] = useState("");
    const [time, setTime] = useState<[Date | null, Date | null] | null>([at(14), at(15)]);
    const [tone, setTone] = useState<PlannedEvent["tone"]>("primary");
    const [error, setError] = useState<string | undefined>();

    const openFor = (date: Date) => {
      setDraftDay(date);
      setTitle("");
      setTime([at(14), at(15)]);
      setTone("primary");
      setError(undefined);
    };
    const save = () => {
      if (!title.trim()) {
        setError("Başlık gerekli.");
        return;
      }
      setEvents((prev) => [...prev, { id: Date.now(), date: draftDay!, title: title.trim(), start: time?.[0] ?? at(9), end: time?.[1] ?? at(10), tone }]);
      setDraftDay(null);
    };
    const ofDay = (d: Date) => events.filter((e) => isSameDay(e.date, d)).sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
      <>
        <p className="mb-3 text-sm text-mari-muted">Bir güne tıklayın (ya da ok tuşlarıyla gidip Enter'a basın) — etkinlik formu açılır.</p>
        <Calendar
          onSelect={(date, { source }) => source === "date" && openFor(date)}
          cellRender={(date, info) =>
            info.type === "date" && ofDay(date).length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {ofDay(date)
                  .slice(0, 2)
                  .map((e) => (
                    <li key={e.id} className={`truncate rounded-sm px-1 py-0.5 ${TONE[e.tone]}`}>
                      {formatDate(e.start, "HH:mm")} {e.title}
                    </li>
                  ))}
                {ofDay(date).length > 2 && <li className="px-1 text-mari-muted">+{ofDay(date).length - 2} daha</li>}
              </ul>
            ) : null
          }
        />
        <Modal
          open={draftDay !== null}
          title={draftDay ? `Etkinlik ekle — ${formatDate(draftDay, "d MMMM EEEE")}` : ""}
          confirmButtonText="Kaydet"
          cancelButtonText="Vazgeç"
          onConfirm={save}
          onClose={() => setDraftDay(null)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Başlık" required error={error}>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(undefined);
                }}
                placeholder="Ör. Tasarım incelemesi"
              />
            </Field>
            <Field label="Saat">
              <TimePicker range minuteStep={15} value={time} onChange={setTime} rangeLabels={["Başlangıç", "Bitiş"]} />
            </Field>
            <Field label="Tür">
              <Segmented options={TONE_OPTIONS} value={tone} onChange={(v) => setTone(v as PlannedEvent["tone"])} />
            </Field>
          </div>
        </Modal>
      </>
    );
  },
};
