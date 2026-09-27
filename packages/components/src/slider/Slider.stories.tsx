/**
 * Faz 13.6: aralık (iki tutamaç) artık gerçekten çalışıyor; örnekler gerçek
 * senaryolar — fiyat filtresi, ses, termostat, ekolayzır. "Show code" her
 * story'de `storyDoc`'un 2. argümanıyla verilen kodu gösterir. Story
 * seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MinusIcon, PlusIcon, ThermometerIcon, Volume1Icon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Slider } from "./Slider";
import { Button } from "../button";

const meta: Meta<typeof Slider> = {
  title: "Veri Girişi/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir aralıkta değer ya da değer aralığı seçmek için sürüklenebilir kontrol. `defaultValue`/`value` bir dizi " +
            "(`[20, 80]`) olursa iki tutamaçlı aralık olur. `step`, etiketli işaretler (`marks`), değer biçimi " +
            "(`formatValue`), yanında sayı girişi (`showInput`) ve dikey mod destekler. Raya basınca en yakın tutamaç " +
            "oraya gelir; aralıkta tutamaçlar birbirini geçmez.",
          whenToUse: [
            "Yaklaşık/görsel bir değer: ses, parlaklık, sıcaklık.",
            "Bir aralık filtresi: fiyat, tarih yılı, mesafe — `onChangeEnd` ile sadece bırakınca sorgula.",
          ],
          whenNotToUse: ["Kesin bir sayı gerekiyorsa — `Input type=\"number\"` (ya da `showInput` ile ikisi birlikte)."],
          a11y:
            "Her tutamaç `role=\"slider\"`: `aria-valuenow`/`valuemin`/`valuemax`/`orientation`, `formatValue` metin " +
            "döndürüyorsa `aria-valuetext` (\"2.500 ₺\"). Klavye: ←/↓ ve →/↑ bir adım, PageUp/PageDown aralığın %10'u, " +
            "Home/End uçlar. Aralık tutamaçları \"… en az\" / \"… en çok\" adını alır (`thumbLabels`). Görünür etiket " +
            "yoksa `aria-label` verin. Ray kutusu en az 24px kalın — küçük tutamaçta da dokunma hedefi yeterli.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: false, description: "Controlled değer — sayı ya da `[başlangıç, bitiş]`." },
    defaultValue: { control: "object", description: "Uncontrolled başlangıç. Dizi verilirse aralık." },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number", description: "Varsayılan: `1`. Ondalıklı olabilir." },
    size: baseSizeArgType,
    color: { ...colorArgType, description: "Dolu kısım + tutamaç halkası. Varsayılan: `primary`." },
    vertical: { control: "boolean" },
    disabled: disabledArgType,
    showInput: { control: "boolean", description: "Yanında senkron sayı girişi (aralıkta iki)." },
    tooltipVisible: { control: "boolean", description: "`false`: değer baloncuğunu hiç gösterme." },
    tooltipAlwaysVisible: { control: "boolean", description: "Baloncuk her zaman görünür." },
    formatValue: { control: false, description: "Baloncuk + aria-valuetext biçimi." },
    marks: { control: "object", description: "Etiketli işaretler: `{ 0: \"0 ₺\", 5000: \"5.000 ₺\" }`." },
    iconList: { control: false },
    onChange: { table: { category: "Olaylar" } },
    onChangeEnd: { description: "Sürükleme/tuş bırakılınca — sorgu için.", table: { category: "Olaylar" } },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

const tl = (v: number) => `${v.toLocaleString("tr-TR")} ₺`;

/* ─────────────────────────── 1. Fiyat aralığı ─────────────────────────── */

export const PriceRange: Story = {
  name: "Fiyat Aralığı (Filtre)",
  ...storyDoc(
    "İki tutamaçlı aralık: `step={250}`, `formatValue` ile ₺ biçimi (baloncuk + ekran okuyucu), `marks` ile uç " +
      "etiketleri, `showInput` ile kesin değer. `onChange` sürüklerken arayüzü günceller; `onChangeEnd` sadece " +
      "bırakınca \"sorgu atar\" — sayaç farkı gösteriyor.",
    `
const [price, setPrice] = useState<[number, number]>([1000, 6000]);

<Slider
  aria-label="Fiyat"
  min={0}
  max={10000}
  step={250}
  value={price}
  onChange={(v) => setPrice(v as [number, number])}
  onChangeEnd={(v) => fetchProducts({ price: v })}
  formatValue={(v) => \`\${v.toLocaleString("tr-TR")} ₺\`}
  marks={{ 0: "0 ₺", 5000: "5.000 ₺", 10000: "10.000 ₺" }}
  showInput
/>`
  ),
  render: () => {
    const [price, setPrice] = useState<[number, number]>([1000, 6000]);
    const [changes, setChanges] = useState(0);
    const [queries, setQueries] = useState(0);
    return (
      <div className="max-w-xl rounded-2xl border border-mari-border bg-mari-surface p-6">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-mari-foreground">Fiyat</p>
          <p className="text-sm tabular-nums text-mari-muted">
            {tl(price[0])} – {tl(price[1])}
          </p>
        </div>
        <Slider
          aria-label="Fiyat"
          min={0}
          max={10000}
          step={250}
          value={price}
          onChange={(v) => {
            setPrice(v as [number, number]);
            setChanges((n) => n + 1);
          }}
          onChangeEnd={() => setQueries((n) => n + 1)}
          formatValue={tl}
          marks={{ 0: "0 ₺", 5000: "5.000 ₺", 10000: "10.000 ₺" }}
          showInput
        />
        <p className="mt-6 text-xs text-mari-muted">
          onChange: <span className="tabular-nums text-mari-foreground">{changes}</span> kez · sorgu (onChangeEnd):{" "}
          <span className="tabular-nums text-mari-foreground">{queries}</span> kez
        </p>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Ses ─────────────────────────── */

function volumeIcon(volume: number) {
  if (volume === 0) return VolumeXIcon;
  return volume < 50 ? Volume1Icon : Volume2Icon;
}

export const Volume: Story = {
  name: "Ses Düzeyi",
  ...storyDoc(
    "Yanlarda sessiz/yüksek ikonları (düğme — tıklayınca 0 / 100), `formatValue` ile yüzde. Tek tutamaçlı " +
      "slider'da dolu kısım sıfırdan değere uzanır.",
    `
<Slider aria-label="Ses düzeyi" value={volume} onChange={setVolume} formatValue={(v) => \`%\${v}\`} />`
  ),
  render: () => {
    const [volume, setVolume] = useState(60);
    const Icon = volumeIcon(volume);
    return (
      <div className="flex max-w-sm items-center gap-3 rounded-2xl border border-mari-border bg-mari-surface px-4 py-3">
        <Button variant="ghost" color="neutral" size="sm" shape="circle" aria-label="Sesi kapat" icon={<Icon size={18} aria-hidden />} onClick={() => setVolume(0)} />
        <div className="min-w-0 flex-1">
          <Slider aria-label="Ses düzeyi" value={volume} onChange={(v) => setVolume(v as number)} formatValue={(v) => `%${v}`} />
        </div>
        <span className="w-10 text-right text-sm tabular-nums text-mari-muted">%{volume}</span>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Termostat ─────────────────────────── */

function tempColor(temp: number): "info" | "success" | "warning" {
  if (temp < 20) return "info";
  return temp <= 24 ? "success" : "warning";
}

export const Thermostat: Story = {
  name: "Termostat (Ondalık Adım)",
  ...storyDoc(
    "`step={0.5}`, `min={16}` `max={30}`, `formatValue` ile °C; −/+ düğmeleri aynı adımla. `color` sıcaklığa " +
      "göre değişiyor (soğuk `info`, ılık `success`, sıcak `warning`).",
    `
<Slider
  aria-label="Hedef sıcaklık"
  min={16}
  max={30}
  step={0.5}
  value={temp}
  onChange={setTemp}
  formatValue={(v) => \`\${v.toLocaleString("tr-TR")} °C\`}
  marks={{ 16: "16°", 22: "22°", 30: "30°" }}
/>`
  ),
  render: () => {
    const [temp, setTemp] = useState(21.5);
    const color = tempColor(temp);
    const clamp = (v: number) => Math.min(30, Math.max(16, v));
    return (
      <div className="max-w-sm rounded-2xl border border-mari-border bg-mari-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-mari-muted">
            <ThermometerIcon size={16} aria-hidden /> Salon
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" color="neutral" size="sm" shape="circle" aria-label="0,5 derece azalt" icon={<MinusIcon size={14} aria-hidden />} onClick={() => setTemp((t) => clamp(t - 0.5))} />
            <span className="w-20 text-center text-2xl font-semibold tabular-nums text-mari-foreground" aria-live="polite">
              {temp.toLocaleString("tr-TR", { minimumFractionDigits: 1 })}°
            </span>
            <Button variant="outline" color="neutral" size="sm" shape="circle" aria-label="0,5 derece artır" icon={<PlusIcon size={14} aria-hidden />} onClick={() => setTemp((t) => clamp(t + 0.5))} />
          </div>
        </div>
        <Slider
          aria-label="Hedef sıcaklık"
          min={16}
          max={30}
          step={0.5}
          color={color}
          value={temp}
          onChange={(v) => setTemp(v as number)}
          formatValue={(v) => `${v.toLocaleString("tr-TR")} °C`}
          marks={{ 16: "16°", 22: "22°", 30: "30°" }}
        />
      </div>
    );
  },
};

/* ─────────────────────────── 4. Ekolayzır (dikey) ─────────────────────────── */

const bands = ["60", "230", "910", "3,6k", "14k"];

export const Equalizer: Story = {
  name: "Ekolayzır (Dikey)",
  ...storyDoc(
    "`vertical` — beş bant, −12…+12 dB. ↑/↓ ile ayarlanır; baloncuk sağda. \"Sıfırla\" tüm bantları 0'a çeker.",
    `
<Slider vertical aria-label="230 Hz" min={-12} max={12} value={gain} onChange={setGain} formatValue={(v) => \`\${v > 0 ? "+" : ""}\${v} dB\`} />`
  ),
  render: () => {
    const [gains, setGains] = useState([3, 1, 0, 2, 4]);
    const setGain = (index: number, gain: number) => setGains((g) => g.map((x, j) => (j === index ? gain : x)));
    return (
      <div className="w-fit rounded-2xl border border-mari-border bg-mari-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-6">
          <p className="text-sm font-semibold text-mari-foreground">Ekolayzır</p>
          <Button size="sm" variant="ghost" color="neutral" onClick={() => setGains(bands.map(() => 0))}>
            Sıfırla
          </Button>
        </div>
        <div className="flex gap-8">
          {bands.map((band, i) => (
            <div key={band} className="flex flex-col items-center gap-2">
              <Slider
                vertical
                size="sm"
                aria-label={`${band} Hz`}
                min={-12}
                max={12}
                value={gains[i]}
                onChange={(v) => setGain(i, v as number)}
                formatValue={(v) => `${v > 0 ? "+" : ""}${v} dB`}
              />
              <span className="text-xs tabular-nums text-mari-muted">{band}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── Temel seçenekler ─────────────────────────── */

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`sm`/`md`/`lg` — ray kalınlığı ve tutamaç çapı ölçeklenir; yatayda genişlik kapsayıcıdan gelir (dikeyde yükseklik `size`'dan).", `<Slider size="lg" defaultValue={50} aria-label="Değer" />`),
  render: () => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex max-w-md items-center gap-4">
          <span className="w-8 shrink-0 font-mono text-xs text-mari-muted">{size}</span>
          <Slider size={size} defaultValue={[25, 70]} aria-label={`${size} aralık`} />
        </div>
      ))}
    </div>
  ),
};

export const IconMarks: Story = {
  name: "İkonlu İşaretler",
  ...storyDoc("`iconList` — geçilen noktalar rol renginde, ilerideki noktalar soluk.", `
<Slider defaultValue={60} aria-label="Ses" iconList={[{ icon: <VolumeXIcon />, value: 0 }, …]} />`),
  args: {
    defaultValue: 60,
    "aria-label": "Ses düzeyi",
    iconList: [
      { icon: <VolumeXIcon size={16} />, value: 0 },
      { icon: <Volume1Icon size={16} />, value: 50 },
      { icon: <Volume2Icon size={16} />, value: 100 },
    ],
  },
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color` — dolu kısım ve tutamaç halkası.", `<Slider color="success" defaultValue={60} aria-label="Değer" />`),
  render: () => (
    <div className="flex max-w-md flex-col gap-5">
      {(["primary", "accent", "success", "warning", "error", "neutral"] as const).map((color, i) => (
        <Slider key={color} color={color} defaultValue={30 + i * 10} aria-label={color} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  name: "Devre Dışı",
  ...storyDoc("`disabled` — sürüklenemez, Tab sırasında değil, soluk.", `<Slider disabled defaultValue={[20, 60]} aria-label="Fiyat" />`),
  args: { defaultValue: [20, 60], "aria-label": "Fiyat", disabled: true },
};

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { defaultValue: 40, min: 0, max: 100, step: 1, size: "md", color: "primary", "aria-label": "Değer" },
};
