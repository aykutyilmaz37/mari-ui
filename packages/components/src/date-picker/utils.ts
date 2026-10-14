import { addDays, compareDay, isBetweenDays, isSameDay, isWithin, startOfDay } from "../lib/date";
import type { RangePosition } from "../calendar/_components/DayGrid";
import type { DatePickerMode, DatePickerPicker } from "./types";

/** DatePicker'ın saf mantığı. */

export function defaultFormat(mode: DatePickerMode, picker: DatePickerPicker, seconds = false): string {
  const time = seconds ? "HH:mm:ss" : "HH:mm";
  if (mode === "time") return time;
  if (mode === "datetime") return `dd.MM.yyyy ${time}`;
  if (picker === "month") return "MM.yyyy";
  if (picker === "year") return "yyyy";
  return "dd.MM.yyyy";
}

/** Yer tutucu: biçimin Türkçe okunuşu ("gg.aa.yyyy ss:dd"). */
const PLACEHOLDER_TOKENS: Record<string, string> = { yyyy: "yyyy", MM: "aa", dd: "gg", HH: "ss", mm: "dd", ss: "sn" };
export function formatPlaceholder(format: string): string {
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (t) => PLACEHOLDER_TOKENS[t]!);
}

/** Gizli form alanı için ISO metin. */
export function isoValue(d: Date | null, mode: DatePickerMode): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const time = `${p(d.getHours())}:${p(d.getMinutes())}`;
  if (mode === "time") return time;
  return mode === "datetime" ? `${date}T${time}` : date;
}

/** Tarihin gününü, saatin saat/dakika/saniyesini birleştirir. */
export const mergeDateTime = (date: Date, time: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());

export function isDayDisabled(d: Date, min?: Date, max?: Date, disabledDate?: (d: Date) => boolean): boolean {
  return !isWithin(d, min, max) || !!disabledDate?.(d);
}

/** Saat sütunu değerleri: 0..max adımla. */
export const columnValues = (max: number, step = 1) => Array.from({ length: Math.ceil((max + 1) / step) }, (_, i) => i * step);

/** Bir değerin sütundaki en yakın adıma yuvarlanmış hali (adım dışı değer listede görünmezdi). */
export const snap = (value: number, step = 1) => Math.floor(value / step) * step;

/**
 * Aralık vurgusu: seçili uçlar ve (seçim sürerken) üzerine gelinen gün.
 * `[start, null]` + hover → start..hover önizlemesi.
 */
export function rangePosition(d: Date, start: Date | null, end: Date | null, hover: Date | null): RangePosition | null {
  const b = end ?? (start ? (hover ?? start) : null);
  const a = start ?? b;
  if (!a || !b) return null;
  const [lo, hi] = compareDay(a, b) <= 0 ? [a, b] : [b, a];
  if (isSameDay(lo, hi)) return isSameDay(d, lo) ? "single" : null;
  if (isSameDay(d, lo)) return "start";
  if (isSameDay(d, hi)) return "end";
  return isBetweenDays(d, lo, hi) ? "middle" : null;
}

/** Aralığı sıraya koyar (bitiş başlangıçtan önceyse yer değiştirir). */
export function orderRange(a: Date | null, b: Date | null): [Date | null, Date | null] {
  if (a && b && a.getTime() > b.getTime()) return [b, a];
  return [a, b];
}

/** Hazır aralık örnekleri için yardımcı: son N gün (bugün dahil). */
export const lastDays = (n: number): [Date, Date] => {
  const today = startOfDay(new Date());
  return [addDays(today, -(n - 1)), today];
};
