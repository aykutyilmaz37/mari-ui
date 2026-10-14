import type { ArgTypes } from "@storybook/react";

/**
 * Storybook standardı: `@mari-ui/core`'un paylaştığı 5 eksen
 * (color/variant/size/radius/placement) HER component'te tekrar tekrar
 * aynı Türkçe açıklamayla tanımlanmasın diye ortak argType parçaları.
 *
 * Sadece `.stories.tsx` dosyalarından import edilir — bu dosya hiçbir
 * component'in `index.ts`'inden erişilmez, dolayısıyla tsup'ın ürettiği
 * dist çıktısına hiç girmez (Storybook'a özgü `@storybook/react` tipi
 * çalışma zamanı paketine sızmaz).
 */

export const colorArgType: ArgTypes[string] = {
  control: "select",
  options: ["primary", "accent", "success", "error", "warning", "info", "neutral"],
  description: "Semantik renk rolü.",
  table: { category: "Görünüm" },
};

export const variantArgType: ArgTypes[string] = {
  control: "select",
  options: ["solid", "outline", "soft", "ghost", "link"],
  description: "Dolgu stili — ne kadar \"dolu\" göründüğü.",
  table: { category: "Görünüm" },
};

export const sizeArgType: ArgTypes[string] = {
  control: "select",
  options: ["xs", "sm", "md", "lg", "xl"],
  description: "Boyut ölçeği.",
  table: { category: "Görünüm" },
};

/** Sadece sm/md/lg destekleyen component'ler için (çoğu form kontrolü). */
export const baseSizeArgType: ArgTypes[string] = {
  control: "select",
  options: ["sm", "md", "lg"],
  description: "Boyut ölçeği.",
  table: { category: "Görünüm" },
};

export const placementArgType: ArgTypes[string] = {
  control: "select",
  options: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "left-start", "left-end", "right", "right-start", "right-end"],
  description: "Konumlandırma yönü.",
  table: { category: "Konum" },
};

export const disabledArgType: ArgTypes[string] = {
  control: "boolean",
  description: "Devre dışı bırakır — tıklanamaz/etkileşimsiz hale gelir.",
  table: { category: "Durum" },
};

export const classNameArgType: ArgTypes[string] = {
  control: false,
  description: "Kök elemana eklenecek ek CSS class'ı.",
  table: { category: "Gelişmiş" },
};
