import type { Size } from "@mari-ui/core";

/** Dikey slider'ın yüksekliği. Yatay slider kapsayıcının tam genişliğini alır. */
const VERTICAL_LENGTH: Record<Size, string> = {
  sm: "10rem",
  md: "14rem",
  lg: "16rem",
};

export function getVerticalLength(size: Size): string {
  return VERTICAL_LENGTH[size];
}

/*
 * ant.design rail/handle oranlarına yakın: sm≈4/12px, md≈6/16px, lg≈8/20px.
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

export function toPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/** İşaretçi konumundan (ray kutusuna göre) ham değer. Dikeyde aşağıdan yukarı artar. */
export function valueFromPointer(clientX: number, clientY: number, rect: DOMRect, min: number, max: number, vertical: boolean): number {
  const ratio = vertical ? (rect.bottom - clientY) / rect.height : (clientX - rect.left) / rect.width;
  const clamped = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
  return min + clamped * (max - min);
}

/** Aralıkta işaretçiye en yakın tutamaç; eşit uzaklıkta, işaretçinin yönündeki. */
export function nearestThumb(values: number[], target: number): number {
  if (values.length < 2) return 0;
  const [a = 0, b = 0] = values;
  if (a === b) return target > b ? 1 : 0;
  return Math.abs(target - a) <= Math.abs(target - b) ? 0 : 1;
}

/** Klavye tuşuna göre yeni değer (sınırlar tutamacın kendi aralığı). `null`: ilgisiz tuş. */
export function valueFromKey(key: string, current: number, lo: number, hi: number, step: number, fullMin: number, fullMax: number): number | null {
  const big = Math.max(step, (fullMax - fullMin) / 10);
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return Math.min(hi, current + step);
    case "ArrowLeft":
    case "ArrowDown":
      return Math.max(lo, current - step);
    case "PageUp":
      return Math.min(hi, current + big);
    case "PageDown":
      return Math.max(lo, current - big);
    case "Home":
      return lo;
    case "End":
      return hi;
    default:
      return null;
  }
}
