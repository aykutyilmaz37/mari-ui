import type { Size } from "@mari-ui/core";

/**
 * Uzunluk artık `rem` STRING olarak tutuluyor (Tailwind `w-*` class'ı değil)
 * — hem yatay hem dikey modda aynı değer JS tarafında da (dikey modda
 * kapsayıcı kutunun boyutlarını ayırmak için) gerekiyor; class + inline
 * style'ı ayrı ayrı senkron tutmak yerine tek kaynak.
 */
const HORIZONTAL_LENGTH: Record<Size, string> = {
  sm: "10rem", // w-40
  md: "16rem", // w-64
  lg: "24rem", // w-96
};

const VERTICAL_LENGTH: Record<Size, string> = {
  sm: "10rem", // w-40
  md: "14rem", // w-56
  lg: "16rem", // w-64
};

export function getLength(size: Size, vertical: boolean | undefined): string {
  return vertical ? VERTICAL_LENGTH[size] : HORIZONTAL_LENGTH[size];
}

/**
 * Kullanıcı geri bildirimi (Faz 13): `size` eskiden yalnızca kapsayıcının
 * UZUNLUĞUNU değiştiriyordu — track/thumb'ın kendisi (native `<input
 * type="range">`, tarayıcı varsayılanı) her boyutta AYNI kalınlıktaydı,
 * yan yana konunca "hepsi aynı boyutta" görünüyordu. Artık track kalınlığı
 * ve thumb çapı da `size`'a göre değişiyor (ant.design'ın rail/handle
 * oranlarına yakın: sm≈4px/12px, md≈6px/16px, lg≈8px/20px).
 */
export const TRACK_HEIGHT: Record<Size, string> = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
};

export const THUMB_SIZE: Record<Size, string> = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.25rem",
};
