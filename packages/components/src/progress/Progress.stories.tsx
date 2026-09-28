/**
 * Faz 16.2: gerçek senaryolar — dosya yükleme listesi (süren/biten/hatalı),
 * şifre gücü (steps), depolama kullanımı (daire), kurulum kontrol listesi.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileTextIcon, ImageIcon, VideoIcon } from "lucide-react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Progress } from "./Progress";
import { Field } from "../field";
import { Input } from "../input";

const meta: Meta<typeof Progress> = {
  title: "Geri Bildirim/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir işin ne kadarının bittiğini gösterir. Çizgi (varsayılan), `steps` ile parçalı çizgi, `type=\"circle\"` daire. " +
            "`%100` kendiliğinden başarı (✓); `status=\"exception\"` hata (✕); `status=\"active\"` süren iş (akan parıltı). " +
            "`success` ile ikinci, tamamlanmış kısım. `format` metni özelleştirir (\"3 / 5 dosya\").",
          whenToUse: ["Süresi ölçülebilen işler (yükleme, dışa aktarma), kota/kullanım, adım tamamlama oranı."],
          whenNotToUse: [
            "Ne kadar süreceği bilinmeyen bekleme — Loading (spinner).",
            "Çok adımlı bir akışta nerede olunduğu — Steps.",
          ],
          a11y:
            "`role=\"progressbar\"` + `aria-valuenow/min/max` ve okunur `aria-valuetext` (\"%45\", \"3 / 5 dosya\", \"%100, " +
            "tamamlandı\", \"%62, hata\"). Ad zorunlu: `aria-label` ya da görünür başlığa `aria-labelledby`. Durum rengi tek " +
            "başına anlam taşımaz — ikon ve valuetext de söyler. Geçişler ve parıltı hareket azaltmada durur.",
        }),
      },
    },
  },
  argTypes: {
    percent: { control: { type: "range", min: 0, max: 100 } },
    type: { control: "inline-radio", options: ["line", "circle"] },
    status: { control: "inline-radio", options: [undefined, "normal", "active", "success", "exception"] },
    color: { ...colorArgType, description: "Varsayılan: `primary` (durum verilince durumun rengi)." },
    steps: { control: "number" },
    showInfo: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    format: { control: false },
    success: { control: false },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

/* ─────────────────────────── 1. Dosya yükleme ─────────────────────────── */

export const Uploads: Story = {
  name: "Dosya Yükleme Listesi",
  ...storyDoc(
    "Her satırda dosya adı çubuğun adı (`aria-labelledby`). Süren: `active`; biten: %100 → ✓; hatalı: `exception` + neden.",
    `
<p id="f1">rapor-eylul.pdf</p>
<Progress aria-labelledby="f1" percent={percent} status="active" size="sm" />
<Progress aria-labelledby="f3" percent={62} status="exception" size="sm" />`
  ),
  render: () => {
    const [video, setVideo] = useState(12);
    useEffect(() => {
      const t = setInterval(() => setVideo((v) => (v >= 100 ? 12 : Math.min(100, v + 7))), 600);
      return () => clearInterval(t);
    }, []);
    const files = [
      { id: "f1", name: "tanitim-videosu.mp4", size: "84 MB", icon: <VideoIcon size={18} aria-hidden />, percent: video, status: video < 100 ? ("active" as const) : undefined },
      { id: "f2", name: "rapor-eylul.pdf", size: "1,2 MB", icon: <FileTextIcon size={18} aria-hidden />, percent: 100 },
      { id: "f3", name: "kapak-gorseli.png", size: "6,8 MB", icon: <ImageIcon size={18} aria-hidden />, percent: 62, status: "exception" as const, error: "Bağlantı kesildi" },
    ];
    return (
      <ul className="max-w-md divide-y divide-mari-border rounded-xl border border-mari-border bg-mari-surface">
        {files.map((f) => (
          <li key={f.id} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 text-mari-muted">{f.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p id={f.id} className="truncate text-sm font-medium text-mari-foreground">
                  {f.name}
                </p>
                <span className="shrink-0 text-xs text-mari-muted">{f.error ?? f.size}</span>
              </div>
              <Progress aria-labelledby={f.id} percent={f.percent} status={f.status} size="sm" />
            </div>
          </li>
        ))}
      </ul>
    );
  },
};

/* ─────────────────────────── 2. Şifre gücü ─────────────────────────── */

function strength(pw: string): { percent: number; color: "error" | "warning" | "success"; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-ZÇĞİÖŞÜ]/.test(pw) && /[a-zçğıöşü]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^\wçğıöşüÇĞİÖŞÜ]/.test(pw)) score++;
  const percent = (score / 5) * 100;
  if (score <= 2) return { percent, color: "error", label: "Zayıf" };
  if (score <= 3) return { percent, color: "warning", label: "Orta" };
  return { percent, color: "success", label: "Güçlü" };
}

export const PasswordStrength: Story = {
  name: "Şifre Gücü (steps)",
  ...storyDoc(
    "`steps={5}` parçalı çizgi; renk güce göre, metin `format` ile (\"Zayıf/Orta/Güçlü\") — ekran okuyucu da onu okur.",
    `<Progress aria-label="Şifre gücü" steps={5} percent={s.percent} color={s.color} format={() => s.label} />`
  ),
  render: () => {
    const [pw, setPw] = useState("mari2026");
    const s = strength(pw);
    return (
      <div className="flex max-w-sm flex-col gap-2">
        <Field label="Yeni şifre" hint="En az 12 karakter, büyük/küçük harf, rakam ve sembol">
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Progress aria-label="Şifre gücü" steps={5} percent={pw ? s.percent : 0} color={s.color} format={() => (pw ? s.label : "")} size="sm" />
      </div>
    );
  },
};

/* ─────────────────────────── 3. Depolama ─────────────────────────── */

export const Storage: Story = {
  name: "Depolama Kullanımı (daire)",
  ...storyDoc(
    "`type=\"circle\"` + `format`: ortada \"72 / 100 GB\". Kota dolmaya yakınken `color=\"warning\"`.",
    `<Progress type="circle" aria-label="Depolama" percent={72} color="warning" format={() => "72 GB"} />`
  ),
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {[
        { label: "Fotoğraflar", used: 18, total: 50, size: "sm" as const },
        { label: "Depolama", used: 72, total: 100, size: "md" as const },
        { label: "Yedekler", used: 100, total: 100, size: "lg" as const },
      ].map((d) => {
        const percent = (d.used / d.total) * 100;
        return (
          <figure key={d.label} className="flex flex-col items-center gap-2">
            <Progress
              type="circle"
              size={d.size}
              aria-label={d.label}
              percent={percent}
              color={percent >= 70 && percent < 100 ? "warning" : undefined}
              format={percent < 100 ? () => `${d.used} GB` : undefined}
            />
            <figcaption className="text-xs text-mari-muted">
              {d.label} · {d.used}/{d.total} GB
            </figcaption>
          </figure>
        );
      })}
    </div>
  ),
};

/* ─────────────────────────── 4. Kurulum ─────────────────────────── */

export const Onboarding: Story = {
  name: "Kurulum Kontrol Listesi",
  ...storyDoc(
    "Başlık çubuğun adı; `format` \"3 / 5 tamamlandı\". Bitince kendiliğinden ✓.",
    `<h3 id="setup">Hesabınızı kurun</h3>
<Progress aria-labelledby="setup" percent={(done / 5) * 100} format={() => \`\${done} / 5 tamamlandı\`} />`
  ),
  render: () => {
    const tasks = ["Profil fotoğrafı ekle", "Ekibi davet et", "İlk projeyi oluştur", "Takvimi bağla", "Bildirimleri ayarla"];
    const [done, setDone] = useState<boolean[]>([true, true, true, false, false]);
    const count = done.filter(Boolean).length;
    const toggle = (i: number) => setDone((d) => d.map((v, j) => (j === i ? !v : v)));
    return (
      <div className="max-w-sm rounded-xl border border-mari-border bg-mari-surface p-4">
        <h3 id="setup" className="mb-2 text-sm font-semibold text-mari-foreground">
          Hesabınızı kurun
        </h3>
        <Progress aria-labelledby="setup" percent={(count / tasks.length) * 100} format={() => `${count} / ${tasks.length}`} />
        <ul className="mt-3 space-y-1.5">
          {tasks.map((t, i) => (
            <li key={t}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-mari-foreground">
                <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} className="accent-mari-primary" />
                {t}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  },
};

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { "aria-label": "İlerleme", percent: 45, type: "line", showInfo: true, size: "md", skeleton: false },
  render: (args) => (
    <div className="max-w-md">
      <Progress {...args} />
    </div>
  ),
};
