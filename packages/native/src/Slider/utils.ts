/** Slider'ın saf hesapları (testli) — web `Slider/utils.ts` ile aynı sözleşme. */

export type SliderValue = number | [number, number];

/** `step`'in ondalık basamak sayısı — 0.1 + 0.2 gibi kayan nokta artıklarını temizlemek için. */
function decimals(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Değeri `[min, max]`e sıkıştırır ve `min`den başlayan `step` ızgarasına oturtur. */
export function snap(value: number, min: number, max: number, step: number): number {
  const safeStep = step > 0 ? step : 1;
  const snapped = Math.round((value - min) / safeStep) * safeStep + min;
  const clamped = Math.min(max, Math.max(min, snapped));
  return Number(clamped.toFixed(decimals(safeStep)));
}

/** 0–1 oranı. */
export function toRatio(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * Dokunuş konumundan ham değer. Tutamaç ray İÇİNDE kalır (iOS UISlider):
 * kullanılabilir uzunluk `length - thumb`, tutamaç merkezi `thumb/2`den başlar.
 * Dikeyde aşağıdan yukarı artar.
 */
export function valueFromOffset(offset: number, length: number, thumb: number, min: number, max: number, vertical: boolean): number {
  const usable = length - thumb;
  if (usable <= 0) return min;
  const along = Math.min(1, Math.max(0, (offset - thumb / 2) / usable));
  const ratio = vertical ? 1 - along : along;
  return min + ratio * (max - min);
}

/** Aralıkta dokunuşa en yakın tutamaç; eşit uzaklıkta dokunuşun yönündeki. */
export function nearestThumb(values: number[], target: number): number {
  if (values.length < 2) return 0;
  const [a = 0, b = 0] = values;
  if (a === b) return target > b ? 1 : 0;
  return Math.abs(target - a) <= Math.abs(target - b) ? 0 : 1;
}

export function toArray(value: SliderValue): number[] {
  return typeof value === "number" ? [value] : [value[0], value[1]];
}

/** Bir tutamacın gidebileceği aralık — aralıkta diğer tutamacı geçemez. */
export function thumbBounds(values: number[], index: number, min: number, max: number): [number, number] {
  if (values.length < 2) return [min, max];
  return index === 0 ? [min, values[1] ?? max] : [values[0] ?? min, max];
}

/**
 * Dolu kısmın [başlangıç, bitiş] konumu (ray boyunca, pt). `offsets` her
 * tutamacın baş kenarı; dolgu tutamaç MERKEZLERİNE uzanır. Tekte yatayda
 * baştan tutamaca, dikeyde tutamaçtan dibe (değer aşağıdan yukarı artar);
 * aralıkta iki tutamaç arası.
 */
export function fillSpan(offsets: number[], thumb: number, length: number, vertical: boolean): [number, number] {
  const centers = offsets.map((o) => o + thumb / 2);
  const [a = 0, b = 0] = centers;
  if (centers.length === 2) return [Math.min(a, b), Math.max(a, b)];
  return vertical ? [a, length] : [0, a];
}

/** Ekran okuyucu artır/azalt: adım kadar, tutamacın kendi aralığında. */
export function stepValue(current: number, direction: 1 | -1, step: number, lo: number, hi: number): number {
  return direction === 1 ? Math.min(hi, current + step) : Math.max(lo, current - step);
}
