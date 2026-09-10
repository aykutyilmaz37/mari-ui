import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, classNameArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Divider } from "./Divider";
import type { DividerProps } from "./types";

const meta: Meta<typeof Divider> = {
  title: "Genel/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "İçerik bloklarını görsel olarak ayıran ince bir çizgi. Yatayda bir başlık/etiket taşıyabilir, dikeyde sabit bir " +
            "yükseklik alır. Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
          whenToUse: [
            "Bir sayfa veya kart içinde ilgisiz bölümleri görsel olarak ayırmak için.",
            "Bir satır içi öğe grubunu (butonlar, linkler) dikey bir çizgiyle bölmek için (`orientation=\"vertical\"`).",
            "Bir bölümün başında kısa bir başlık göstermek için (`children` + `labelAlign`).",
          ],
          whenNotToUse: [
            "Yapısal bir gruplama gerekiyorsa — `Card` veya `<fieldset>` semantik bir sınır oluşturur, Divider yalnızca çizgidir.",
            "Öğeler arasında yalnızca boşluk gerekiyorsa — `gap`/`margin` yeterli.",
          ],
          a11y:
            "Kök öğe `role=\"separator\"` taşır; dikey modda `aria-orientation=\"vertical\"` eklenir (yatay zaten varsayılan). " +
            "Odaklanabilir değildir — saf bir ayraçtır.",
        }),
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Yatay modda çizginin üzerinde gösterilecek etiket." },
    className: classNameArgType,
    lineStyle: { control: "select", options: ["solid", "dashed", "dotted"], description: "Çizgi stili.", table: { defaultValue: { summary: "solid" } } },
    orientation: { control: "select", options: ["horizontal", "vertical"], description: "Yön.", table: { defaultValue: { summary: "horizontal" } } },
    labelAlign: { control: "select", options: ["start", "center", "end"], description: "Yatay modda etiketin hizası.", table: { defaultValue: { summary: "center" } } },
    labelMargin: { control: "text", description: "Etiketin kenardan uzaklığı (start/end hizasında)." },
    plain: { control: "boolean", description: "Etiket metnini nötr (soluk) renkte gösterir.", table: { defaultValue: { summary: "true" } } },
    style: { control: false },
    size: baseSizeArgType,
    height: { control: "text", description: "Sadece dikey modda — `rem` önerilir; sayı verilirse `px` kabul edilir.", table: { defaultValue: { summary: "3rem" } } },
  },
};

export default meta;

export const Playground: StoryObj<DividerProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    children: "Lorem Ipsum.",
    lineStyle: "solid",
    orientation: "horizontal",
    labelAlign: "center",
    labelMargin: "0.75rem",
    plain: true,
    size: "md",
  },
};

export const Varyantlar: StoryObj = {
  name: "Çizgi Stilleri",
  ...storyDoc("`solid` / `dashed` / `dotted` — çizgi stili bir dolgu değil, geometrik bir özellik olduğu için `variant` ekseninden ayrıdır."),
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
  name: "Dikey",
  ...storyDoc("Satır içi öğeleri böler. `height` `rem` cinsinden veya yüzde verilir (`px` yerine — 4K ekranlarda kök font'la ölçeklensin)."),
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
  ...storyDoc("Etiket `labelAlign=\"end\"` ile sağa yaslanır; `labelMargin` kenar boşluğunu ayarlar."),
  args: {
    children: "Sona Hizalı",
    lineStyle: "dashed",
    labelAlign: "end",
    labelMargin: "1.25rem",
    orientation: "horizontal",
  },
};
