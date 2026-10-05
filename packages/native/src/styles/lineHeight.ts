/**
 * Web'in satır yüksekliği — Tailwind `text-*` ölçeği (component'ler yazı
 * boyutunu bu sınıflarla alır, satır yüksekliği de onlardan gelir):
 * xs 12/16 · sm 14/20 · base 16/24 · lg 18/28 · xl 20/28 · 2xl 24/32 · 3xl 30/36.
 *
 * Native'de satır yüksekliği verilmezse platform kendi değerini kullanır →
 * metnin dikey yeri ve bileşenin yüksekliği web'den sapar (web ↔ native
 * ölçümünde bulundu). Ölçek dışı boyutta web'in `leading-normal`ı (1.5).
 */
const TAILWIND_LINE_HEIGHT: Record<number, number> = { 12: 16, 14: 20, 16: 24, 18: 28, 20: 28, 24: 32, 30: 36, 36: 40 };

export function lineHeightFor(fontSize: number): number {
  return TAILWIND_LINE_HEIGHT[fontSize] ?? Math.round(fontSize * 1.5);
}
