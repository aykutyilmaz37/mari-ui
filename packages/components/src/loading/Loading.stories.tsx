import type { Meta, StoryObj } from "@storybook/react";
import { colorArgType } from "../lib/storybookArgTypes";
import { Loading } from "./Loading";

/**
 * Eskiden bu component'in hiç story'si yoktu — ve görsel olarak bozuktu
 * (bkz. utils.ts'teki not: `fill-${line}` çalışma zamanında üretiliyordu,
 * Tailwind bunu hiç göremiyordu). Faz 3'te düzeltildi, Faz 4'te standart
 * şablona taşındı.
 */
const meta: Meta<typeof Loading> = {
  title: "Geri Bildirim/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tam ekranı kaplayan bir dönen (spinner) yükleme göstergesi. **Ne zaman kullanılır:** Sayfa/route " +
          "geçişleri gibi tüm ekranı bloklayan yüklemelerde. **Ne zaman kullanılmaz:** Sadece bir bölüm/kart " +
          "yükleniyorsa `Skeleton` daha uygun bir seçenektir (tüm ekranı kaplamaz). Hook kullanmaz, sunucu bileşeni " +
          "olarak render edilebilir.",
      },
    },
  },
  argTypes: {
    color: { ...colorArgType, description: "Dönen animasyonun dolgu (fill) rengi. Varsayılan: `info`." },
    trackColor: { ...colorArgType, description: "Arka plan halkasının rengi. Varsayılan: `neutral`." },
  },
};

export default meta;

export const Playground: StoryObj<typeof Loading> = {
  args: { color: "info", trackColor: "neutral" },
};
