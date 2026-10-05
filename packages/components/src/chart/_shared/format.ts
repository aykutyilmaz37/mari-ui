import type { ChartColor } from "../types";

/** Seri rengi → CSS değeri. Palet sırası: verilmezse `index`ten (8'den sonra başa dönmez, son renkte kalır). */
export function seriesColor(color: ChartColor | undefined, index: number): string {
  if (typeof color === "string") return `var(--mari-color-${color}-solid)`;
  const slot = color ?? Math.min(index + 1, 8);
  return `var(--mari-color-chart-${slot})`;
}

export function makeFormatters(locale: string, valueFormatter?: (value: number) => string) {
  const full = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  return {
    /** Tooltip ve tablo: tam değer. */
    value: valueFormatter ?? ((v: number) => full.format(v)),
    /** Eksen: kısaltılmış (12,5 B) — özel biçim verildiyse o. */
    axis: valueFormatter ?? ((v: number) => (Math.abs(v) >= 10_000 ? compact.format(v) : full.format(v))),
  };
}
