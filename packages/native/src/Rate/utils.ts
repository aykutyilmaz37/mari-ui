/** Rate'in saf hesapları (testli). */

export interface RateGeometry {
  count: number;
  /** Yıldız kutusu (pt). */
  size: number;
  /** Yıldızlar arası boşluk (pt). */
  gap: number;
  allowHalf: boolean;
}

/**
 * Satırın solundan `x` uzaklıktaki dokunuşun puanı. Boşluk bir sonraki
 * yıldıza değil öncekine sayılır (parmak yıldızdan biraz taşsa da puan
 * düşmez). Sonuç her zaman [adım, count] aralığında — sıfırlamak
 * `allowClear` ile aynı puana yeniden dokunarak yapılır.
 */
export function rateValueAt(x: number, { count, size, gap, allowHalf }: RateGeometry): number {
  const pitch = size + gap;
  const index = Math.min(count - 1, Math.max(0, Math.floor(x / pitch)));
  const within = x - index * pitch;
  return allowHalf && within < size / 2 ? index + 0.5 : index + 1;
}

/** Bir yıldızın dolu oranı (0–1). `exact`: salt gösterimde ondalık oran (4,3 → 5. yıldızın %30'u). */
export function starFraction(value: number, index: number, allowHalf: boolean, exact: boolean): number {
  const raw = Math.min(1, Math.max(0, value - index));
  if (exact) return raw;
  if (raw >= 1) return 1;
  return allowHalf && raw >= 0.5 ? 0.5 : 0;
}

/** Ekran okuyucu metni: "4,5 / 5" (Intl'e bağlı değil). */
export function rateValueText(value: number, count: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${String(rounded).replace(".", ",")} / ${count}`;
}

/** Artır/azalt eylemi (ekran okuyucu) — adım kadar, sınırlar içinde. */
export function stepRate(value: number, direction: 1 | -1, count: number, allowHalf: boolean): number {
  const step = allowHalf ? 0.5 : 1;
  return Math.min(count, Math.max(0, Math.round((value + direction * step) * 2) / 2));
}
