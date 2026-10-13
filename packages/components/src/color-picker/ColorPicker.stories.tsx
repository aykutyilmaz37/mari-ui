/**
 * Faz 16.4: gerçek senaryolar — marka rengi ayarı (Field + canlı önizleme),
 * etiket rengi (opaklıksız, hazır renkler), vurgu kalemi (renk yok), boyutlar
 * (Input/Select ile hizalı), biçimler. "Show code" her story'de `storyDoc`'un
 * 2. argümanı. Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Button } from "../button";
import { Field } from "../field";
import { Input } from "../input";
import { Select } from "../select";
import { ColorPicker } from "./ColorPicker";
import type { ColorFormat, ColorPreset } from "./types";

const meta: Meta<typeof ColorPicker> = {
  title: "Veri Girişi/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "34rem" },
      description: {
        component: componentDoc({
          summary:
            "Renk seçtiren kontrol: tetikleyicide seçili rengin kutusu (isteğe bağlı metni), panelde doygunluk/parlaklık alanı, " +
            "ton ve opaklık kaydırıcıları, HEX/RGB/HSB girişleri ve hazır renk grupları. Değer metin olarak verilir/alınır " +
            "(`#1677ff`, `rgb(…)`, `hsb(…)`); `onChange` sürüklerken, `onChangeComplete` bırakınca çağrılır.",
          whenToUse: [
            "Kullanıcının serbest bir renk belirlediği ayarlar: marka/tema rengi, etiket ya da takvim rengi, çizim aracı.",
            "Hazır bir palet önerip istenirse özel renge izin vermek (`presets`).",
          ],
          whenNotToUse: [
            "Yalnız birkaç sabit renkten biri seçilecekse — renk kutulu RadioGroup/Segmented daha hızlı.",
            "Anlamı olan durumlar (başarı/hata) için — kullanıcıya renk değil durum seçtirin; renkler tema token'larından gelir.",
          ],
          a11y:
            "Tetikleyici `aria-haspopup=\"dialog\"`; seçili renk açıklama olarak okunur (\"#1677ff, opaklık %50\"). Açılınca odak " +
            "2B alana geçer: ←/→ doygunluk, ↑/↓ parlaklık (Shift ile 10), ton/opaklık `role=\"slider\"`. Her değer metin " +
            "girişiyle de verilebilir — sürükleme zorunlu değil. Hazır renkler `aria-pressed`. Escape kapatır, odak geri döner. " +
            "Field içinde ad etiketten gelir.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: "text" },
    onChange: { table: { category: "Olaylar" } },
    onChangeComplete: { table: { category: "Olaylar" } },
    onFormatChange: { table: { category: "Olaylar" } },
    onOpenChange: { table: { category: "Olaylar" } },
    presets: { control: false },
    format: { control: "inline-radio", options: ["hex", "rgb", "hsb"] },
    defaultFormat: { control: "inline-radio", options: ["hex", "rgb", "hsb"], table: { defaultValue: { summary: "hex" } } },
    showText: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    allowClear: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabledAlpha: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    trigger: { control: "inline-radio", options: ["click", "hover"], table: { defaultValue: { summary: "click" } } },
    size: baseSizeArgType,
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

const BRAND_PRESETS: ColorPreset[] = [
  { label: "Önerilen", colors: ["#2f66a3", "#557293", "#0f766e", "#15803d", "#b45309", "#be123c", "#7c3aed", "#0369a1", "#384959", "#111827"] },
  { label: "Açık tonlar", colors: ["#bdddfc", "#88bdf2", "#99f6e4", "#bbf7d0", "#fde68a", "#fecdd3", "#ddd6fe", "#bae6fd", "#e2e8f0", "#f8fafc"], defaultOpen: false },
];

export const Playground: Story = {
  args: { defaultValue: "#2f66a3", showText: true, presets: BRAND_PRESETS },
};

/* ─────────────────────────── 1. Marka rengi ─────────────────────────── */

export const BrandColor: Story = {
  name: "Marka Rengi Ayarı",
  ...storyDoc(
    "Ayarlar formunda: Field etiketi tetikleyicinin adıdır, ipucu açıklamaya eklenir. Önizleme `onChange` ile canlı " +
      "güncellenir; kaydetme gibi ağır işler `onChangeComplete`te (sürükleme bitince) yapılır.",
    `<Field label="Marka rengi" hint="Düğmeler ve bağlantılarda kullanılır.">
  <ColorPicker value={color} onChange={setColor} onChangeComplete={save} showText disabledAlpha presets={presets} />
</Field>`
  ),
  render: () => {
    const [color, setColor] = useState<string | null>("#2f66a3");
    const [saved, setSaved] = useState("#2f66a3");
    return (
      <div className="flex max-w-xl flex-wrap items-start gap-8">
        <Field label="Marka rengi" hint="Düğmeler ve bağlantılarda kullanılır.">
          <ColorPicker value={color} onChange={setColor} onChangeComplete={(v) => v && setSaved(v)} showText disabledAlpha presets={BRAND_PRESETS} />
        </Field>
        {/* Önizlenen e-posta/sayfa her temada açık zeminli — marka rengi onun üstünde değerlendirilir. */}
        <div className="flex min-w-56 flex-1 flex-col gap-3 rounded-lg border border-mari-border p-4" style={{ background: "#ffffff", color: "#111827" }}>
          <p className="text-sm" style={{ color: "#4b5563" }}>Önizleme</p>
          <p className="text-sm">
            Hesabınızı doğrulamak için{" "}
            <a href="#onizleme" className="font-medium underline" style={{ color: color ?? undefined }}>
              bağlantıya tıklayın
            </a>
            .
          </p>
          <button type="button" className="self-start rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: color ?? undefined }}>
            Devam et
          </button>
          <p className="text-xs" style={{ color: "#4b5563" }}>Son kaydedilen: {saved}</p>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Etiket rengi ─────────────────────────── */

const LABELS = [
  { name: "Hata", color: "#be123c" },
  { name: "Özellik", color: "#2f66a3" },
  { name: "Belge", color: "#0f766e" },
];

export const LabelColors: Story = {
  name: "Etiket Rengi",
  ...storyDoc(
    "Listede her satırın kendi küçük seçicisi. Opaklık kapalı (`disabledAlpha`) — etiket zemini hep opak; tetikleyici " +
      "yalnız renk kutusu, adı satırdaki etikete göre verilir.",
    `
const [labels, setLabels] = useState([
  { name: "Hata", color: "#be123c" },
  { name: "Özellik", color: "#2f66a3" },
  { name: "Belge", color: "#0f766e" },
]);

<ul>
  {labels.map((label, i) => (
    <li key={label.name} className="flex items-center gap-3">
      <ColorPicker
        size="sm"
        aria-label={\`\${label.name} etiketinin rengi\`}
        value={label.color}
        disabledAlpha
        presets={[{ label: "Önerilen", colors: ["#2f66a3", "#0f766e", "#15803d", "#b45309", "#be123c", "#7c3aed"] }]}
        onChange={(color) => color && setLabels((prev) => prev.map((l, j) => (j === i ? { ...l, color } : l)))}
      />
      <span className="rounded-full px-2 py-0.5 text-xs text-white" style={{ backgroundColor: label.color }}>{label.name}</span>
    </li>
  ))}
</ul>`
  ),
  render: () => {
    const [labels, setLabels] = useState(LABELS);
    const recolor = (index: number, color: string | null) => {
      if (color) setLabels((prev) => prev.map((l, j) => (j === index ? { ...l, color } : l)));
    };
    return (
      <ul className="flex max-w-sm flex-col divide-y divide-mari-border rounded-lg border border-mari-border">
        {labels.map((label, i) => (
          <li key={label.name} className="flex items-center gap-3 px-3 py-2">
            <ColorPicker
              size="sm"
              aria-label={`${label.name} etiketinin rengi`}
              value={label.color}
              disabledAlpha
              presets={BRAND_PRESETS.slice(0, 1)}
              onChange={(v) => recolor(i, v)}
            />
            <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: label.color }}>
              {label.name}
            </span>
            <span className="ml-auto font-mono text-xs text-mari-muted">{label.color}</span>
          </li>
        ))}
      </ul>
    );
  },
};

/* ─────────────────────────── 3. Vurgu kalemi ─────────────────────────── */

export const Highlighter: Story = {
  name: "Vurgu Kalemi (Renk Yok)",
  ...storyDoc(
    "`allowClear` panelde \"Renk yok\" seçeneği ekler; değer `null` olur ve tetikleyicide çizgili kutu görünür. " +
      "Opaklık açık — yarı saydam vurgu metni okunur bırakır.",
    `<ColorPicker aria-label="Vurgu rengi" value={mark} onChange={setMark} allowClear showText format="rgb" />`
  ),
  render: () => {
    const [mark, setMark] = useState<string | null>("rgba(250, 204, 21, 0.45)");
    return (
      <div className="flex max-w-lg flex-col gap-4">
        <ColorPicker aria-label="Vurgu rengi" value={mark} onChange={setMark} allowClear showText format="rgb" />
        <p className="text-sm leading-relaxed">
          Toplantıda alınan karar: <mark style={{ backgroundColor: mark ?? "transparent", color: "inherit" }}>yeni sürüm 14 Ekim'de yayınlanacak</mark>, test
          ortamı bir hafta önce dondurulacak.
        </p>
      </div>
    );
  },
};

/* ─────────────────────────── 4. Boyutlar ─────────────────────────── */

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc(
    "Yükseklik Input/Select ile aynı (sm 24 / md 32 / lg 40px) — bir araç çubuğunda yan yana hizalı durur.",
    `<ColorPicker size="sm" defaultValue="#2f66a3" />
<ColorPicker size="md" defaultValue="#2f66a3" showText />
<ColorPicker size="lg" defaultValue="#2f66a3" showText />`
  ),
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-2">
          <Input size={size} aria-label={`Başlık (${size})`} defaultValue="Kampanya" className="w-40" />
          <Select size={size} aria-label={`Yazı tipi (${size})`} defaultValue="inter" options={[{ value: "inter", label: "Inter" }, { value: "serif", label: "Serif" }]} className="w-32" />
          <ColorPicker size={size} aria-label={`Yazı rengi (${size})`} defaultValue="#2f66a3" />
          <ColorPicker size={size} aria-label={`Zemin rengi (${size})`} defaultValue="#bdddfc" showText />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <ColorPicker aria-label="Devre dışı" defaultValue="#2f66a3" showText disabled />
        <ColorPicker aria-label="Hatalı" defaultValue="#2f66a3" color="error" />
              </div>
    </div>
  ),
};

/* ─────────────────────────── 5. Biçimler ─────────────────────────── */

const NEXT_FORMAT: Record<ColorFormat, ColorFormat> = { hex: "rgb", rgb: "hsb", hsb: "hex" };

export const Formats: Story = {
  name: "Biçimler",
  ...storyDoc(
    "`format` girişlerin ve `onChange` metninin biçimidir; kullanıcı panelden değiştirebilir (`onFormatChange`). " +
      "İkinci argüman (`ColorInfo`) her biçimi birden verir.",
    `<ColorPicker format={format} onFormatChange={setFormat} onChange={(value, info) => setInfo(info)} showText />`
  ),
  render: () => {
    const [format, setFormat] = useState<ColorFormat>("hex");
    const [info, setInfo] = useState<{ hex: string; rgb: string; hsb: string } | null>({ hex: "#2f66a3", rgb: "rgb(47, 102, 163)", hsb: "hsb(212, 71%, 64%)" });
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ColorPicker aria-label="Renk" defaultValue="#2f66a3" format={format} onFormatChange={setFormat} onChange={(_v, i) => setInfo(i)} showText />
          <Button size="sm" variant="ghost" onClick={() => setFormat(NEXT_FORMAT[format])}>
            Biçimi değiştir
          </Button>
        </div>
        <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
          {(["hex", "rgb", "hsb"] as const).map((f) => (
            <React.Fragment key={f}>
              <dt className="text-mari-muted uppercase">{f}</dt>
              <dd className={f === format ? "font-semibold" : undefined}>{info?.[f] ?? "—"}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    );
  },
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<ColorPicker defaultValue="#2f66a3" showText skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <ColorPicker aria-label="Marka rengi" defaultValue="#2f66a3" showText skeleton={skeleton} />}</SkeletonDemo>,
};
