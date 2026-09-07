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
