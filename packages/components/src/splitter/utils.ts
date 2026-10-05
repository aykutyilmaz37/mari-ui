import type { SplitterSize } from "./types";

/**
 * Splitter'ın saf boyut hesabı (DOM'suz, ayrıca test edilir). Boyutlar
 * panellerin kullanılabilir alana ORANI (toplam 1) olarak tutulur — kapsayıcı
 * büyüyüp küçülünce paneller orantılı kalır. Piksel min/max her hesapta o anki
 * kullanılabilir alana göre orana çevrilir.
 */

/** `280` → 280 / available, `"30%"` → 0.3. */
export function toFraction(size: SplitterSize | undefined, available: number): number | undefined {
  if (size === undefined) return undefined;
  if (typeof size === "number") return available > 0 ? size / available : 0;
  return Number.parseFloat(size) / 100;
}

export interface PanelLimits {
  min: number;
  max: number;
}

export function limitsOf(min: SplitterSize | undefined, max: SplitterSize | undefined, available: number): PanelLimits {
  return { min: toFraction(min, available) ?? 0, max: Math.min(1, toFraction(max, available) ?? 1) };
}

/**
 * İlk oranlar: verilen boyutlar alınır, verilmeyenler kalanı eşit paylaşır,
 * sonra toplam 1'e ölçeklenir (fazla verilmişse orantılı küçülür).
 */
export function initialSizes(defaults: Array<SplitterSize | undefined>, available: number): number[] {
  const given = defaults.map((d) => toFraction(d, available));
  const used = given.reduce<number>((sum, f) => sum + (f ?? 0), 0);
  const free = given.filter((f) => f === undefined).length;
  const share = free > 0 ? Math.max(0, 1 - used) / free : 0;
  const raw = given.map((f) => f ?? share);
  const total = raw.reduce((a, b) => a + b, 0) || 1;
  return raw.map((f) => f / total);
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Tutamaç `index` (panel `index` ile `index + 1` arasında) `delta` oranı kadar
 * kaydırılır. Yalnız iki komşu panel değişir; ikisinin toplamı korunur, her
 * biri kendi min/max'ında kalır.
 */
export function moveHandle(sizes: number[], index: number, delta: number, limits: PanelLimits[]): number[] {
  const a = sizes[index]!;
  const b = sizes[index + 1]!;
  const pair = a + b;
  const la = limits[index]!;
  const lb = limits[index + 1]!;
  // a'nın gidebileceği aralık: kendi sınırları ve b'nin sınırlarının izin verdiği.
  const lo = Math.max(la.min, pair - lb.max);
  const hi = Math.min(la.max, pair - lb.min);
  const nextA = clamp(a + delta, lo, Math.max(lo, hi));
  const next = sizes.slice();
  next[index] = nextA;
  next[index + 1] = pair - nextA;
  return next;
}

/**
 * Daraltma: `panel` 0'a iner, alanı tutamacın öbür yanındaki komşuya geçer.
 * Açarken `restore` (daraltmadan önceki oran) komşudan geri alınır.
 */
export function setPanelSize(sizes: number[], panel: number, neighbor: number, value: number): number[] {
  const next = sizes.slice();
  const pair = sizes[panel]! + sizes[neighbor]!;
  next[panel] = clamp(value, 0, pair);
  next[neighbor] = pair - next[panel]!;
  return next;
}

/** Kayıtlı oranlar panel sayısıyla uyuşuyor ve geçerliyse döner. */
export function parseStored(raw: string | null, count: number): number[] | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length !== count || !value.every((v) => typeof v === "number" && v >= 0)) return null;
    const total = value.reduce((a: number, b: number) => a + b, 0);
    return total > 0 ? value.map((v: number) => v / total) : null;
  } catch {
    return null;
  }
}
