import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, classNameArgType } from "../lib/storybookArgTypes";
import { Divider } from "./Divider";
import type { DividerProps } from "./types";

const meta: Meta<typeof Divider> = {
  title: "Genel/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "İçerik bloklarını görsel olarak ayıran ince bir çizgi. Yatayda bir başlık/etiket taşıyabilir, dikeyde sabit bir yükseklik alır. " +
          "**Ne zaman kullanılır:** Bir sayfa veya kart içinde ilgisiz bölümleri ayırmak için. **Ne zaman kullanılmaz:** Yapısal bir " +
          "gruplama gerekiyorsa (örn. bir Card veya fieldset) — Divider sadece görsel bir çizgidir, semantik bir sınır oluşturmaz. " +
          "Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Yatay modda çizginin üzerinde gösterilecek etiket." },
    className: classNameArgType,
    lineStyle: { control: "select", options: ["solid", "dashed", "dotted"], description: "Çizgi stili." },
    orientation: { control: "select", options: ["horizontal", "vertical"], description: "Yön." },
    labelAlign: { control: "select", options: ["start", "center", "end"], description: "Yatay modda etiketin hizası." },
    labelMargin: { control: "text", description: "Etiketin kenardan uzaklığı (start/end hizasında)." },
    plain: { control: "boolean", description: "Etiket metnini nötr (soluk) renkte gösterir." },
    style: { control: false },
    size: baseSizeArgType,
  },
};

export default meta;

export const Playground: StoryObj<DividerProps> = {
  args: {
    children: "Lorem Ipsum.",
    lineStyle: "solid",
    orientation: "horizontal",
    labelAlign: "center",
    labelMargin: "12px",
    plain: true,
    size: "md",
  },
};

export const Varyantlar: StoryObj = {
  name: "Varyantlar",
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {(["solid", "dashed", "dotted"] as const).map((lineStyle) => (
        <Divider key={lineStyle} lineStyle={lineStyle}>
          {lineStyle}
        </Divider>
      ))}
    </div>
  ),
};

export const Vertical: StoryObj<DividerProps> = {
  render: (args) => (
    <div className="h-40 flex items-center justify-center gap-4">
      <span>Sol</span>
      <Divider {...args} />
      <span>Sağ</span>
    </div>
  ),
  args: {
    orientation: "vertical",
    lineStyle: "dotted",
    height: "80%",
  },
};

export const DashedEndWithMargin: StoryObj<DividerProps> = {
  name: "Sona Hizalı, Kesikli",
  args: {
    children: "Sona Hizalı",
    lineStyle: "dashed",
    labelAlign: "end",
    labelMargin: 20,
    orientation: "horizontal",
  },
};
