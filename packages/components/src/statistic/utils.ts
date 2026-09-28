/**
 * Faz 16.2 — Statistic ailesinin saf yardımcıları (DOM'suz, ayrıca test edilir).
 */

/** tr-TR sayı: `1234567.8` → "1.234.567,8"; `precision` sabit basamak. */
export function formatValue(value: number | string, precision: number | undefined, locale: string): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat(locale, { minimumFractionDigits: precision ?? 0, maximumFractionDigits: precision ?? 20 }).format(value);
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Yüzde saniye (kronometre). */
  centis: number;
}

export function splitDuration(ms: number): DurationParts {
  const total = Math.max(0, Math.floor(ms));
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000) % 24,
    minutes: Math.floor(total / 60_000) % 60,
    seconds: Math.floor(total / 1000) % 60,
    centis: Math.floor(total / 10) % 100,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Geri sayım: gün varsa "2 gün 04:12:09", yoksa "04:12:09"; saat de yoksa "12:09".
 * `showDays: false` günleri saate katar ("52:12:09").
 */
export function formatCountdown(ms: number, { showDays = true }: { showDays?: boolean } = {}): string {
  const p = splitDuration(ms);
  const hours = showDays ? p.hours : p.hours + p.days * 24;
  const clock = hours > 0 || (showDays && p.days > 0) ? `${pad(hours)}:${pad(p.minutes)}:${pad(p.seconds)}` : `${pad(p.minutes)}:${pad(p.seconds)}`;
  return showDays && p.days > 0 ? `${p.days} gün ${clock}` : clock;
}

/** Kronometre: "05:07,42" (dk:sn,salise); bir saati geçince "1:05:07,42". */
export function formatStopwatch(ms: number): string {
  const p = splitDuration(ms);
  const hours = p.hours + p.days * 24;
  const base = `${pad(p.minutes)}:${pad(p.seconds)},${pad(p.centis)}`;
  return hours > 0 ? `${hours}:${base}` : base;
}

/** Ekran okuyucu için sözlü süre: "2 gün 4 saat 12 dakika 9 saniye" (sıfır birimler atlanır). */
export function spokenDuration(ms: number): string {
  const p = splitDuration(ms);
  const parts = [
    [p.days, "gün"],
    [p.hours, "saat"],
    [p.minutes, "dakika"],
    [p.seconds, "saniye"],
  ] as const;
  const spoken = parts.filter(([n]) => n > 0).map(([n, unit]) => `${n} ${unit}`);
  return spoken.length ? spoken.join(" ") : "0 saniye";
}

export type TrendTone = "good" | "bad" | "neutral";

/**
 * Trendin rengi yönden değil ANLAMdan: gelir artışı iyi, maliyet/iade artışı
 * kötü (`goodWhen="down"`). 0 → nötr.
 */
export function trendTone(change: number, goodWhen: "up" | "down"): TrendTone {
  if (change === 0) return "neutral";
  const up = change > 0;
  return up === (goodWhen === "up") ? "good" : "bad";
}
