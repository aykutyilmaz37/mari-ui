import type { Meta, StoryObj } from "@storybook/react";
import { Leaf } from "lucide-react";
import { baseSizeArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Veri Girişi/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Sayısal bir aralıkta değer seçmek için sürüklenebilir kontrol. İşaretli noktalar (`iconList`), yanında " +
          "bir sayı girişi (`showInput`) ve dikey mod destekler. Kendisi `Input` (native range) ve `Tooltip`ı " +
          "birlikte kullanır. **Not:** eskiden `Tooltip`e `disabled={tooltipVisible}` geçiriliyordu — " +
          "`tooltipVisible=true` iken tooltip'i GİZLEYEN ters bir mantıktı, düzeltildi.",
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
  args: { defaultValue: 50 },
};

export const WithIcons: Story = {
  name: "İşaretli Noktalarla",
  args: {
    defaultValue: 50,
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
  args: {
    defaultValue: 40,
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
  args: { defaultValue: 30, showInput: true },
};

export const Disabled: Story = {
  name: "Devre Dışı",
  args: { defaultValue: 60, disabled: true },
};
