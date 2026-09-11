import type { Meta, StoryObj } from "@storybook/react";
import { Leaf } from "lucide-react";
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
            "bir sayı girişi (`showInput`) ve dikey mod destekler. Track/thumb rengi native `accent-color` ile " +
            "temadan gelir — özel bir çizim gerekmez.",
          whenToUse: ["Kesin bir sayı yerine yaklaşık/görsel bir aralıkta değer seçtirmek için (ses düzeyi, fiyat aralığı)."],
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
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { defaultValue: 50, "aria-label": "Değer" },
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`sm`/`md`/`lg` — genişliği değiştirir (kalınlık native `accent-color`'a bağlı, tarayıcıya göre değişir)."),
  render: () => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Slider key={size} size={size} defaultValue={50} aria-label={`${size} boyut`} />
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  name: "İşaretli Noktalarla",
  ...storyDoc("`iconList` ile belirli değerlerin altına/üstüne ikon yerleştirilir."),
  args: {
    defaultValue: 50,
    "aria-label": "Değer",
    iconList: [
      { icon: <Leaf size={16} />, value: 0 },
      { icon: <Leaf size={16} />, value: 50 },
      { icon: <Leaf size={16} />, value: 100 },
    ],
    tooltipAlwaysVisible: true,
  },
};

export const Vertical: Story = {
  name: "Dikey",
  ...storyDoc("`vertical` — yukarı/aşağı sürüklenir."),
  args: {
    defaultValue: 40,
    "aria-label": "Değer",
    vertical: true,
    tooltipAlwaysVisible: true,
    iconPosition: "top",
    iconList: [
      { icon: <Leaf size={16} />, value: 20 },
      { icon: <Leaf size={16} />, value: 40 },
      { icon: <Leaf size={16} />, value: 80 },
    ],
    showInput: true,
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
