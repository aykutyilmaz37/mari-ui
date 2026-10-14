import type { ColorFormat, ColorInfo, Hsba, Rgba } from "./types";

/**
 * ColorPicker'ın saf renk mantığı. İç model HSB(+alfa): 2B alan
 * doygunluk × parlaklık, kaydırıcılar ton ve alfa. Hex/RGB yalnız giriş ve
 * çıkışta hesaplanır — RGB'ye gidip gelmek tonu kaybettirir (ör. siyahta
 * ton 0'a düşer, kullanıcının seçtiği ton kaybolurdu).
 */

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

export function hsbToRgb({ h, s, b, a }: Hsba): Rgba {
  const sat = s / 100;
  const val = b / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return val - val * sat * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a };
}

function hueOf(r: number, g: number, b: number, max: number, d: number): number {
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

export function rgbToHsb({ r, g, b, a }: Rgba): Hsba {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  return { h: hueOf(rn, gn, bn, max, d), s: max === 0 ? 0 : (d / max) * 100, b: max * 100, a };
}

function hslToHsb(h: number, s: number, l: number, a: number): Hsba {
  // b = l + s·min(l, 1−l); s_b = 2(1 − l/b)
  const sl = s / 100;
  const ll = l / 100;
  const b = ll + sl * Math.min(ll, 1 - ll);
  return { h, s: b === 0 ? 0 : 2 * (1 - ll / b) * 100, b: b * 100, a };
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function toHex({ r, g, b, a }: Rgba): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ""}`;
}

export function toRgbString({ r, g, b, a }: Rgba): string {
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${round(a, 2)})` : `rgb(${r}, ${g}, ${b})`;
}

export function toHsbString({ h, s, b, a }: Hsba): string {
  const body = `${Math.round(h)}, ${Math.round(s)}%, ${Math.round(b)}%`;
  return a < 1 ? `hsba(${body}, ${round(a, 2)})` : `hsb(${body})`;
}

function parseHex(input: string): Rgba | null {
  const m = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(input);
  if (!m) return null;
  let digits = m[1]!;
  if (digits.length <= 4) digits = [...digits].map((c) => c + c).join("");
  const n = (i: number) => Number.parseInt(digits.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? round(n(6) / 255, 3) : 1 };
}

/** `0.5`, `50%` → 0.5; yoksa 1. */
function parseAlpha(part: string | undefined): number {
  if (part === undefined) return 1;
  const v = Number.parseFloat(part);
  if (Number.isNaN(v)) return 1;
  return clamp(part.trim().endsWith("%") ? v / 100 : v, 0, 1);
}

const FUNC_RE = /^(rgba?|hsba?|hsva?|hsla?)\(([^)]*)\)$/i;

function parseFunc(input: string): Hsba | null {
  const m = FUNC_RE.exec(input);
  if (!m) return null;
  const kind = m[1]!.toLowerCase().slice(0, 3);
  // Virgüllü (`rgb(1, 2, 3)`) ve modern boşluklu (`rgb(1 2 3 / 50%)`) yazım.
  const parts = m[2]!.replace(/[,/]/g, " ").trim().split(/\s+/);
  if (parts.length < 3) return null;
  const [x, y, z] = parts.slice(0, 3).map((p) => Number.parseFloat(p)) as [number, number, number];
  if ([x, y, z].some(Number.isNaN)) return null;
  const a = parseAlpha(parts[3]);
  if (kind === "rgb") {
    const ch = (p: string, v: number) => clamp(Math.round(p.endsWith("%") ? (v / 100) * 255 : v), 0, 255);
    return rgbToHsb({ r: ch(parts[0]!, x), g: ch(parts[1]!, y), b: ch(parts[2]!, z), a });
  }
  const h = ((x % 360) + 360) % 360;
  if (kind === "hsl") return hslToHsb(h, clamp(y, 0, 100), clamp(z, 0, 100), a);
  // hsb() olduğu gibi — RGB'ye gidip gelmek tonu yuvarlar.
  return { h, s: clamp(y, 0, 100), b: clamp(z, 0, 100), a };
}

/** Hex (3/4/6/8 hane, `#` isteğe bağlı), `rgb[a]()`, `hsb[a]()`/`hsv()`, `hsl[a]()`. Tanınmazsa `null`. */
export function parseColor(input: string | null | undefined): Hsba | null {
  if (!input) return null;
  const text = input.trim();
  const fn = parseFunc(text);
  if (fn) return fn;
  const hex = parseHex(text);
  return hex ? rgbToHsb(hex) : null;
}

export function colorInfo(hsba: Hsba): ColorInfo {
  const rgba = hsbToRgb(hsba);
  return { hsba, rgba, hex: toHex(rgba), rgb: toRgbString(rgba), hsb: toHsbString(hsba) };
}

export function formatColor(hsba: Hsba, format: ColorFormat): string {
  return colorInfo(hsba)[format];
}

/** İki renk görsel olarak aynı mı (8 bit RGB + 2 hane alfa) — preset seçili göstergesi için. */
export function sameColor(a: Hsba | null, b: Hsba | null): boolean {
  if (!a || !b) return a === b;
  return toHex(hsbToRgb(a)) === toHex(hsbToRgb(b));
}

/** Saf ton (s=b=100) — 2B alanın arka planı. */
export const hueColor = (h: number) => `hsl(${h} 100% 50%)`;

/**
 * Rengin üstünde okunacak işaretçi/metin rengi: açık zeminde koyu, koyu zeminde
 * açık. Alfa düşükse (zemin dama deseni, açık) koyu.
 */
export function isLight(hsba: Hsba): boolean {
  if (hsba.a < 0.5) return true;
  const { r, g, b } = hsbToRgb(hsba);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
}

/** Ekran okuyucu için kısa açıklama: "#1677ff, opaklık %50". */
export function describeColor(hsba: Hsba | null, empty = "Renk yok"): string {
  if (!hsba) return empty;
  const { hex } = colorInfo({ ...hsba, a: 1 });
  return hsba.a < 1 ? `${hex}, opaklık %${Math.round(hsba.a * 100)}` : hex;
}

export type AreaKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End" | "PageUp" | "PageDown";

/**
 * 2B alanın klavyesi: ←/→ doygunluk, ↑/↓ parlaklık (1, Shift ile 10);
 * Home/End doygunluk 0/100, PageUp/PageDown parlaklık 100/0.
 */
export function areaKeyStep(key: string, shift: boolean, s: number, b: number): { s: number; b: number } | null {
  const step = shift ? 10 : 1;
  const map: Record<AreaKey, () => { s: number; b: number }> = {
    ArrowLeft: () => ({ s: s - step, b }),
    ArrowRight: () => ({ s: s + step, b }),
    ArrowUp: () => ({ s, b: b + step }),
    ArrowDown: () => ({ s, b: b - step }),
    Home: () => ({ s: 0, b }),
    End: () => ({ s: 100, b }),
    PageUp: () => ({ s, b: 100 }),
    PageDown: () => ({ s, b: 0 }),
  };
  const fn = map[key as AreaKey];
  if (!fn) return null;
  const next = fn();
  return { s: clamp(next.s, 0, 100), b: clamp(next.b, 0, 100) };
}

/** Tek eksenli kaydırıcı (ton, alfa) klavyesi. Tanınmayan tuş → `null`. */
export function sliderKeyStep(key: string, shift: boolean, value: number, min: number, max: number, step: number): number | null {
  const big = step * 10;
  const delta: Record<string, number> = {
    ArrowRight: shift ? big : step,
    ArrowUp: shift ? big : step,
    ArrowLeft: shift ? -big : -step,
    ArrowDown: shift ? -big : -step,
    PageUp: big,
    PageDown: -big,
  };
  if (key === "Home") return min;
  if (key === "End") return max;
  const d = delta[key];
  return d === undefined ? null : clamp(value + d, min, max);
}

/** İşaretçi konumundan 0–1 oran (öğenin kutusuna göre, sınırlarda kesilir). */
export function ratioFromPointer(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }) {
  return {
    x: rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0,
    y: rect.height ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0,
  };
}
