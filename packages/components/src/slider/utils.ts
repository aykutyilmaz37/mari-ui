import type { Size } from "@mari-ui/core";

/**
 * Eskiden `w-lg`/`w-md`/`w-sm`/`w-xs` kullanılıyordu — bunlar Tailwind'in
 * `w-*` (width) skalasında GERÇEKTEN VAR OLMAYAN class'lardı (bu isimler
 * sadece `max-w-*` skalasında gerçek). Sessizce hiçbir genişlik
 * uygulanmıyordu — bu repodaki bir başka "sessizce bozuk" örnek. Gerçek
 * Tailwind width utility'leriyle düzeltildi.
 */
const HORIZONTAL_WIDTH_CLASS: Record<Size, string> = {
  sm: "w-40",
  md: "w-64",
  lg: "w-96",
};

const VERTICAL_WIDTH_CLASS: Record<Size, string> = {
  sm: "w-40",
  md: "w-56",
  lg: "w-64",
};

export function getSizeClasses(size: Size, vertical: boolean | undefined): string {
  return vertical ? VERTICAL_WIDTH_CLASS[size] : HORIZONTAL_WIDTH_CLASS[size];
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
