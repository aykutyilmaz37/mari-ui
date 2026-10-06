import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Minus, Plus, Sun, SunDim, SunMedium, Thermometer, Volume1, Volume2, VolumeX } from "lucide-react-native";
import { Slider } from "./Slider";
import { Button } from "../Button";
import { Card } from "../Card";
import { Text, Title } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Slider> = {
  title: "Native/Veri Girişi/Slider",
  component: Slider,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Bir aralıkta değer ya da değer aralığı seçmek için sürüklenebilir kontrol. `value` dizi (`[20, 80]`) olursa iki tutamaçlı aralık; `step`, `marks`, `formatValue`, `showInput` ve dikey mod.",
    whenToUse: ["Yaklaşık/görsel değer: ses, parlaklık, sıcaklık.", "Aralık filtresi: fiyat, mesafe — `onChangeEnd` ile yalnız bırakınca sorgula."],
    whenNotToUse: ["Kesin sayı gerekiyorsa — sayı girişi (ya da `showInput` ile ikisi birlikte)."],
    vsWeb: "Prop'lar aynı (`aria-label` → `accessibilityLabel`). Görünüm iOS UISlider ölçüsünde: md tutamaç 28pt, tutamaç rayın İÇİNDE kalır; dokunma alanı en az 44pt. Hover yok → değer baloncuğu sürüklerken görünür (`tooltipAlwaysVisible` ile hep). Kaydırılan ekranda sürükleme ScrollView'a kaptırılmaz. Ekran okuyucuda her tutamaç `adjustable` (yukarı/aşağı kaydırma bir adım). Dikeyde ikonlar solda, işaretler sağda. Ölçüler `nativeConfig.slider`.",
  }) } } },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"] },
    vertical: { control: "boolean" },
    disabled: { control: "boolean" },
    tooltipAlwaysVisible: { control: "boolean" },
    showInput: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { defaultValue: 40, min: 0, max: 100, step: 1, size: "md", color: "primary", vertical: false, disabled: false, tooltipAlwaysVisible: false, showInput: false, skeleton: false, accessibilityLabel: "Değer" },
};
export default meta;
type Story = StoryObj<typeof Slider>;

const tl = (v: number) => `${v.toLocaleString("tr-TR")} ₺`;

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  decorators: [withStretch],
  render: (args) => <Slider {...args} />,
};

function PriceFilter() {
  const [price, setPrice] = useState<[number, number]>([1000, 6000]);
  const [changes, setChanges] = useState(0);
  const [queries, setQueries] = useState(0);
  return (
    <Card>
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text weight="semibold">Fiyat</Text>
          <Text muted style={{ fontVariant: ["tabular-nums"] }}>{`${tl(price[0])} – ${tl(price[1])}`}</Text>
        </View>
        <Slider
          accessibilityLabel="Fiyat"
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
        <Text muted style={{ fontSize: 13 }}>{`onChange: ${changes} kez · sorgu (onChangeEnd): ${queries} kez`}</Text>
      </View>
    </Card>
  );
}

export const PriceRange: Story = {
  name: "Fiyat Aralığı (Filtre)",
  ...storyDoc(
    "İki tutamaçlı aralık: `step={250}`, `formatValue` ile ₺, uç etiketleri (`marks`), kesin değer için `showInput`. `onChange` sürüklerken arayüzü günceller; `onChangeEnd` yalnız parmak kalkınca \"sorgu atar\" — sayaç farkı gösteriyor.",
    `<Slider
  accessibilityLabel="Fiyat"
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
  decorators: [withStretch],
  render: () => <PriceFilter />,
};

function volumeIcon(volume: number) {
  if (volume === 0) return VolumeX;
  return volume < 50 ? Volume1 : Volume2;
}

function VolumeRow() {
  const theme = useTheme();
  const [volume, setVolume] = useState(60);
  const Icon = volumeIcon(volume);
  return (
    <Card size="sm">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Button variant="ghost" color="neutral" size="sm" shape="circle" accessibilityLabel="Sesi kapat" icon={<Icon size={18} color={theme.color.canvas.foreground} />} onPress={() => setVolume(0)} />
        <View style={{ flex: 1 }}>
          <Slider accessibilityLabel="Ses düzeyi" value={volume} onChange={(v) => setVolume(v as number)} formatValue={(v) => `%${v}`} />
        </View>
        <Text muted style={{ width: 40, textAlign: "right", fontVariant: ["tabular-nums"] }}>{`%${volume}`}</Text>
      </View>
    </Card>
  );
}

export const Volume: Story = {
  name: "Ses Düzeyi",
  ...storyDoc("Solda sessiz düğmesi (dokununca 0), `formatValue` ile yüzde. Tek tutamaçta dolu kısım sıfırdan değere uzanır.", `<Slider accessibilityLabel="Ses düzeyi" value={volume} onChange={setVolume} formatValue={(v) => \`%\${v}\`} />`),
  decorators: [withStretch],
  render: () => <VolumeRow />,
};

function tempColor(t: number): "info" | "success" | "warning" {
  if (t < 20) return "info";
  return t <= 24 ? "success" : "warning";
}

function ThermostatCard() {
  const theme = useTheme();
  const [temp, setTemp] = useState(21.5);
  const clamp = (v: number) => Math.min(30, Math.max(16, v));
  const ink = theme.color.canvas.foreground;
  return (
    <Card>
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Thermometer size={16} color={theme.color.canvas.muted} />
            <Text muted>Salon</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Button variant="outline" color="neutral" size="sm" shape="circle" accessibilityLabel="0,5 derece azalt" icon={<Minus size={14} color={ink} />} onPress={() => setTemp((t) => clamp(t - 0.5))} />
            <Title level={3} accessibilityLiveRegion="polite" style={{ width: 72, textAlign: "center", fontVariant: ["tabular-nums"] }}>{`${temp.toFixed(1).replace(".", ",")}°`}</Title>
            <Button variant="outline" color="neutral" size="sm" shape="circle" accessibilityLabel="0,5 derece artır" icon={<Plus size={14} color={ink} />} onPress={() => setTemp((t) => clamp(t + 0.5))} />
          </View>
        </View>
        <Slider
          accessibilityLabel="Hedef sıcaklık"
          min={16}
          max={30}
          step={0.5}
          color={tempColor(temp)}
          value={temp}
          onChange={(v) => setTemp(v as number)}
          formatValue={(v) => `${v.toLocaleString("tr-TR")} °C`}
          marks={{ 16: "16°", 22: "22°", 30: "30°" }}
        />
      </View>
    </Card>
  );
}

export const Thermostat: Story = {
  name: "Termostat (Ondalık Adım)",
  ...storyDoc(
    "`step={0.5}`, `min={16}` `max={30}`, °C biçimi; −/+ düğmeleri aynı adımla. `color` sıcaklığa göre değişir (soğuk `info`, ılık `success`, sıcak `warning`).",
    `<Slider
  accessibilityLabel="Hedef sıcaklık"
  min={16}
  max={30}
  step={0.5}
  value={temp}
  onChange={setTemp}
  formatValue={(v) => \`\${v.toLocaleString("tr-TR")} °C\`}
  marks={{ 16: "16°", 22: "22°", 30: "30°" }}
/>`
  ),
  decorators: [withStretch],
  render: () => <ThermostatCard />,
};

const BANDS = ["60", "230", "910", "3,6k", "14k"];

function EqualizerCard() {
  const [gains, setGains] = useState([3, 1, 0, 2, 4]);
  const setGain = (index: number, gain: number) => setGains((g) => g.map((x, j) => (j === index ? gain : x)));
  return (
    <Card>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Text weight="semibold">Ekolayzır</Text>
          <Button size="sm" variant="ghost" color="neutral" onPress={() => setGains(BANDS.map(() => 0))}>Sıfırla</Button>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {BANDS.map((band, i) => (
            <View key={band} style={{ alignItems: "center", gap: 6 }}>
              <Slider vertical size="sm" accessibilityLabel={`${band} Hz`} min={-12} max={12} value={gains[i]} onChange={(v) => setGain(i, v as number)} formatValue={(v) => `${v > 0 ? "+" : ""}${v} dB`} />
              <Text muted style={{ fontSize: 12, fontVariant: ["tabular-nums"] }}>{band}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

export const Equalizer: Story = {
  name: "Ekolayzır (Dikey)",
  ...storyDoc("`vertical` — beş bant, −12…+12 dB; baloncuk sağda. \"Sıfırla\" tüm bantları 0'a çeker.", `<Slider vertical size="sm" accessibilityLabel="230 Hz" min={-12} max={12} value={gain} onChange={setGain} formatValue={(v) => \`\${v > 0 ? "+" : ""}\${v} dB\`} />`),
  decorators: [withStretch],
  render: () => <EqualizerCard />,
};

function IconMarksDemo() {
  const theme = useTheme();
  const ink = theme.color.canvas.foreground;
  return (
    <Slider
      defaultValue={60}
      accessibilityLabel="Parlaklık"
      iconList={[
        { icon: <SunDim size={18} color={ink} />, value: 0 },
        { icon: <SunMedium size={18} color={ink} />, value: 50 },
        { icon: <Sun size={18} color={ink} />, value: 100 },
      ]}
    />
  );
}

export const IconMarks: Story = {
  name: "İkonlu İşaretler",
  ...storyDoc("`iconList` — geçilen noktalar tam, ilerideki noktalar soluk.", `<Slider defaultValue={60} accessibilityLabel="Parlaklık" iconList={[{ icon: <SunDim size={18} />, value: 0 }, { icon: <SunMedium size={18} />, value: 50 }, { icon: <Sun size={18} />, value: 100 }]} />`),
  decorators: [withStretch],
  render: () => <IconMarksDemo />,
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("Tutamaç sm 20 · md 28 · lg 32; dokunma alanı hep en az 44.", `<Slider size="sm" defaultValue={30} />
<Slider size="md" defaultValue={50} />
<Slider size="lg" defaultValue={70} />`),
  decorators: [withStretch],
  render: () => (
    <Stack>
      <Slider size="sm" defaultValue={30} accessibilityLabel="Küçük" />
      <Slider size="md" defaultValue={50} accessibilityLabel="Orta" />
      <Slider size="lg" defaultValue={70} accessibilityLabel="Büyük" />
    </Stack>
  ),
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color`: dolu kısım ve tutamaç kenarı.", `<Slider color="success" defaultValue={60} />`),
  decorators: [withStretch],
  render: () => (
    <Stack>
      {(["primary", "accent", "success", "error", "warning", "info", "neutral"] as const).map((color, i) => (
        <Slider key={color} color={color} defaultValue={30 + i * 8} accessibilityLabel={color} />
      ))}
    </Stack>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("`disabled`: soluk, dokunulmaz. `tooltipAlwaysVisible`: baloncuk hep açık.", `<Slider disabled defaultValue={[20, 60]} />
<Slider tooltipAlwaysVisible defaultValue={45} />`),
  decorators: [withStretch],
  render: () => (
    <View style={{ gap: 32, paddingTop: 32 }}>
      <Slider disabled defaultValue={[20, 60]} accessibilityLabel="Devre dışı" />
      <Slider tooltipAlwaysVisible defaultValue={45} accessibilityLabel="Baloncuklu" />
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Slider skeleton={isLoading} value={price} marks={{ 0: "0 ₺", 10000: "10.000 ₺" }} />`),
  decorators: [withStretch],
  render: () => <SkeletonDemo>{(skeleton) => <Slider skeleton={skeleton} defaultValue={[1000, 6000]} min={0} max={10000} step={250} accessibilityLabel="Fiyat" marks={{ 0: "0 ₺", 10000: "10.000 ₺" }} />}</SkeletonDemo>,
};
