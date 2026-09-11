import type { Meta, StoryObj } from "@storybook/react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { baseSizeArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Veri Girişi/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Sayısal bir aralıkta değer seçmek için sürüklenebilir kontrol. İşaretli noktalar (`iconList`), yanında " +
            "bir sayı girişi (`showInput`) ve dikey mod destekler. Track/thumb kendi çizdiğimiz, `size`'a göre " +
            "gerçekten ölçeklenen bir görünümdür (arkada görünmez ama tam işlevli bir native `<input type=\"range\">` " +
            "tüm klavye/fare/dokunma etkileşimini taşır).",
          whenToUse: ["Kesin bir sayı yerine yaklaşık/görsel bir aralıkta değer seçtirmek için (ses düzeyi, parlaklık, fiyat aralığı)."],
          whenNotToUse: ["Kesin bir sayı gerekiyorsa — düz bir `Input type=\"number\"` daha güvenilir."],
          a11y: "Görünür bir `<label>` yoksa mutlaka `aria-label` verin — aksi halde ekran okuyucu kullanıcısı kontrolün ne işe yaradığını bilemez.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: "number", description: "Controlled değer." },
    defaultValue: { control: "number", description: "Uncontrolled başlangıç değeri." },
    min: { control: "number" },
    max: { control: "number" },
    size: baseSizeArgType,
    vertical: { control: "boolean", description: "Dikey mod." },
    disabled: disabledArgType,
    showInput: { control: "boolean", description: "Yanında bir sayı girişi gösterir." },
    tooltipAlwaysVisible: { control: "boolean", description: "Tooltip'i hover beklemeden her zaman gösterir." },
    onChange: { action: "onChange" },
  },
  // Tooltip varsayılan olarak track'in ÜSTÜNDE açılır (`position: absolute`,
  // normal akışa yükseklik katmaz) — kanvasın hemen üst kenarında yeterli
  // boşluk olmayınca araç çubuğuna çarpıp kesiliyordu. Üstte pay bırakıyoruz.
  decorators: [
    (Story) => (
      <div className="pt-10">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { defaultValue: 50, "aria-label": "Değer" },
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`sm`/`md`/`lg` — track kalınlığı ve thumb çapı da (kapsayıcı uzunluğuyla birlikte) gerçekten değişir."),
  render: () => (
    <div className="flex flex-col gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-8 text-sm text-mari-muted uppercase">{size}</span>
          <Slider size={size} defaultValue={50} aria-label={`${size} boyut`} />
        </div>
      ))}
    </div>
  ),
};

export const VolumeControl: Story = {
  name: "Ses Düzeyi",
  ...storyDoc(
    "`iconList` ile 0/50/100 noktalarına anlamlı ikonlar yerleştirilir; geçilen noktalar (`value >= item.value`) " +
      "vurgulanır, ilerideki noktalar soluk kalır."
  ),
  args: {
    defaultValue: 60,
    "aria-label": "Ses düzeyi",
    iconList: [
      { icon: <VolumeX size={16} />, value: 0 },
      { icon: <Volume1 size={16} />, value: 50 },
      { icon: <Volume2 size={16} />, value: 100 },
    ],
  },
};

export const Vertical: Story = {
  name: "Dikey",
  ...storyDoc("`vertical` — yukarı/aşağı sürüklenir. Ekran parlaklığı gibi dikey bir kontrolü örnekler."),
  args: {
    defaultValue: 40,
    "aria-label": "Parlaklık",
    vertical: true,
    tooltipAlwaysVisible: true,
    iconPosition: "top",
    iconList: [
      { icon: <VolumeX size={16} />, value: 0 },
      { icon: <Volume size={16} />, value: 50 },
      { icon: <Volume2 size={16} />, value: 100 },
    ],
  },
};

export const WithInputField: Story = {
  name: "Sayı Girişli",
  ...storyDoc("`showInput` — yanında senkronize bir sayı girişi gösterir, klavyeyle kesin değer girmek için."),
  args: { defaultValue: 30, "aria-label": "Değer", showInput: true },
};

export const Disabled: Story = {
  name: "Devre Dışı",
  ...storyDoc("`disabled` — sürüklenemez, soluk görünür."),
  args: { defaultValue: 60, "aria-label": "Değer", disabled: true },
};
