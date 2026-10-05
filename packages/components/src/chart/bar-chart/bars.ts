import { barPath } from "../_shared/cartesian";
import type { BandScale } from "../_shared/scale";

/** Çubuklar arası yüzey boşluğu (px) — dokunan işaretleri çizgi değil boşluk ayırır. */
export const GAP = 2;

export const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** Değer aralığı; sıfır her zaman dahil (çubuk tabandan büyür). Yığında pozitif/negatif toplamlar ayrı. */
export function valueExtent(rows: number[][], stacked: boolean): [number, number] {
  let lo = 0;
  let hi = 0;
  for (const values of rows) {
    if (stacked) {
      hi = Math.max(hi, values.filter((v) => v > 0).reduce((a, v) => a + v, 0));
      lo = Math.min(lo, values.filter((v) => v < 0).reduce((a, v) => a + v, 0));
    } else {
      hi = Math.max(hi, ...values);
      lo = Math.min(lo, ...values);
    }
  }
  return [lo, hi];
}

export interface BarGeometry {
  horizontal: boolean;
  stacked: boolean;
  band: BandScale;
  value: (v: number) => number;
  thickness: number;
}

export interface BarShape {
  row: number;
  series: number;
  d: string;
}

/** Tek parça: tabandan `from`→`to`; veri ucu yuvarlak, yığında taban tarafı 2px kırpılır. */
function segment(g: BarGeometry, offset: number, from: number, to: number, roundEnd: boolean): string {
  const a = g.value(from);
  const b = g.value(to);
  const radius = roundEnd ? 4 : 0;
  const gap = g.stacked && from !== 0 ? GAP : 0;
  const positive = to >= from;
  const lo = Math.min(a, b);
  const len = Math.abs(b - a) - gap;
  if (g.horizontal) {
    return positive ? barPath(lo + gap, offset, len, g.thickness, radius, "right") : barPath(lo, offset, len, g.thickness, radius, "left");
  }
  return positive ? barPath(offset, lo, g.thickness, len, radius, "top") : barPath(offset, lo + gap, g.thickness, len, radius, "bottom");
}

/** Son pozitif ve son negatif parçanın indeksi — yığında yalnız en dıştaki uç yuvarlanır. */
function outerIndexes(values: number[]): { pos: number; neg: number } {
  let pos = -1;
  let neg = -1;
  values.forEach((v, i) => {
    if (v > 0) pos = i;
    if (v < 0) neg = i;
  });
  return { pos, neg };
}

/** Tüm çubukların yolları. `rows[i][s]`: i. kategori, s. serinin değeri. */
export function buildBars(rows: number[][], g: BarGeometry): BarShape[] {
  const groupCount = g.stacked ? 1 : (rows[0]?.length ?? 1);
  const span = g.thickness * groupCount + GAP * (groupCount - 1);
  const shapes: BarShape[] = [];
  rows.forEach((values, i) => {
    const start = g.band.center(i) - span / 2;
    const outer = outerIndexes(values);
    let pos = 0;
    let neg = 0;
    values.forEach((v, s) => {
      if (v === 0) return;
      if (!g.stacked) {
        shapes.push({ row: i, series: s, d: segment(g, start + s * (g.thickness + GAP), 0, v, true) });
        return;
      }
      const from = v > 0 ? pos : neg;
      if (v > 0) pos += v;
      else neg += v;
      shapes.push({ row: i, series: s, d: segment(g, start, from, from + v, s === (v > 0 ? outer.pos : outer.neg)) });
    });
  });
  return shapes;
}
