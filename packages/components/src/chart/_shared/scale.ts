/**
 * Faz 16.9 — grafiklerin saf matematiği (paket yok — kullanıcı kararı:
 * "paket bağımlılığı istemiyorum"). d3-scale'in ihtiyaç duyduğumuz küçük
 * kısmı: yuvarlak eksen değerleri, doğrusal ve bant ölçek.
 */

/** 1, 2, 5 × 10ⁿ adımlarından `count`a en yakın olanı (d3 `tickStep` ile aynı eşikler). */
export function tickStep(min: number, max: number, count: number): number {
  const raw = Math.abs(max - min) / Math.max(1, count);
  if (raw === 0 || !Number.isFinite(raw)) return 1;
  const power = Math.floor(Math.log10(raw));
  const base = 10 ** power;
  const error = raw / base;
  if (error >= Math.SQRT2 * 5) return 10 * base;
  if (error >= Math.sqrt(10)) return 5 * base;
  if (error >= Math.SQRT2) return 2 * base;
  return base;
}

/** Kayan nokta artığını (0.30000000000000004) temizler. */
const clean = (n: number) => Number.parseFloat(n.toPrecision(12));

export interface NiceDomain {
  min: number;
  max: number;
  ticks: number[];
}

/**
 * Veri aralığını yuvarlak sınırlara genişletir ve eksen değerlerini üretir:
 * (3, 97) → 0…100, [0, 20, 40, 60, 80, 100]. Tüm değerler eşitse aralık
 * yapay olarak açılır (düz çizgi eksenin ortasında durur).
 */
export function niceDomain(min: number, max: number, count = 5): NiceDomain {
  let lo = Math.min(min, max);
  let hi = Math.max(min, max);
  if (lo === hi) {
    const pad = lo === 0 ? 1 : Math.abs(lo) * 0.5;
    lo -= pad;
    hi += pad;
  }
  const step = tickStep(lo, hi, count);
  const niceMin = clean(Math.floor(lo / step) * step);
  const niceMax = clean(Math.ceil(hi / step) * step);
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(clean(v));
  return { min: niceMin, max: niceMax, ticks };
}

/** Doğrusal ölçek: `domain` → `range` (ters de olabilir — SVG'de y aşağı büyür). */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

export interface BandScale {
  (index: number): number;
  /** Bir bandın genişliği (iç boşluk düşülmüş). */
  bandwidth: number;
  /** Bandın merkezi. */
  center: (index: number) => number;
}

/**
 * Kategorik eksen: `count` eşit bant, aralarında `paddingRatio` oranında boşluk.
 * Çubuk grafiğinde x (dikey çubuk) ya da y (yatay çubuk) ekseni.
 */
export function bandScale(count: number, [r0, r1]: [number, number], paddingRatio = 0.3): BandScale {
  const step = (r1 - r0) / Math.max(1, count);
  const bandwidth = step * (1 - paddingRatio);
  const offset = (step - bandwidth) / 2;
  const scale = ((index: number) => r0 + index * step + offset) as BandScale;
  scale.bandwidth = bandwidth;
  scale.center = (index) => r0 + index * step + step / 2;
  return scale;
}

/** Sayı dizisinin [min, max]ı; boşsa [0, 0]. NaN/undefined atlanır. */
export function extent(values: Iterable<number | null | undefined>): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (v == null || Number.isNaN(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return lo === Infinity ? [0, 0] : [lo, hi];
}
