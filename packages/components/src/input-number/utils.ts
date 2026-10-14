/**
 * InputNumber'ın saf sayı mantığı (DOM'suz, ayrıca test edilir).
 *
 * Neden `type="number"` değil: tarayıcı Türkçe ondalık virgülü ve binlik
 * ayıracını (1.234,56) göstermez/kabul etmez, min/max'ı yazarken sınırlamaz,
 * bazı tarayıcılarda harf yazılabilir ve değer boşken `""` ile "geçersiz"i
 * ayırt ettirmez. Burada metin alanı + kendi ayrıştırma/biçimlendirmemiz var.
 */

export interface NumberFormatConfig {
  locale: string;
  /** Ondalık basamak sayısı (sabit). Verilmezse değerin kendi basamakları (en fazla 20). */
  precision?: number;
  /** Binlik ayıracı. Varsayılan: `true`. */
  grouping: boolean;
}

/** Yerelin ondalık ve binlik karakterleri (tr-TR: "," ve "."). */
export function getSeparators(locale: string): { decimal: string; group: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
  return {
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
    group: parts.find((p) => p.type === "group")?.value ?? ",",
  };
}

/** Kayan nokta artıklarını temizleyerek yuvarlar (0.1 + 0.2 → 0.3). */
export function roundTo(value: number, precision: number | undefined): number {
  if (precision === undefined) return Number.parseFloat(value.toPrecision(15));
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function clamp(value: number, min: number | undefined, max: number | undefined): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

/** Ekranda gösterilen biçim (odak dışı): "1.234,56". */
export function formatNumber(value: number | null, { locale, precision, grouping }: NumberFormatConfig): string {
  if (value === null || Number.isNaN(value)) return "";
  return new Intl.NumberFormat(locale, {
    useGrouping: grouping,
    minimumFractionDigits: precision ?? 0,
    maximumFractionDigits: precision ?? 20,
  }).format(value);
}

/** Düzenlerken gösterilen biçim (odakta): binlik ayıracı yok, yerelin ondalığı — "1234,56". */
export function formatForEditing(value: number | null, config: NumberFormatConfig): string {
  return formatNumber(value, { ...config, grouping: false });
}

/**
 * Kullanıcı metnini sayıya çevirir; boş → `null`, anlamsız → `undefined`.
 *
 * Türkçede "." binlik, "," ondalıktır — ama kullanıcı alışkanlıkla "12.5"
 * de yazar. Kural: metinde yerelin ondalığı (",") VARSA "." binlik sayılıp
 * atılır. Yoksa "." yalnız GEÇERLİ binlik gruplaması gibi duruyorsa
 * ("1.234", "1.234.567") binlik; aksi halde ("12.5", "3.14") ondalık kabul
 * edilir.
 */
export function parseNumber(text: string, locale: string): number | null | undefined {
  const { decimal, group } = getSeparators(locale);
  let s = text.replace(/[\s\u00a0\u202f]/g, "");
  if (s === "" || s === "-" || s === "+") return null;

  if (decimal !== "." && s.includes(decimal)) {
    s = s.split(group).join("").replace(decimal, ".");
  } else if (decimal !== "." && group === "." && s.includes(".")) {
    const looksGrouped = /^[-+]?\d{1,3}(\.\d{3})+$/.test(s);
    if (looksGrouped) s = s.split(".").join("");
  } else if (decimal === ".") {
    s = s.split(group).join("");
  }

  // Doğrusal kontrol (geri izlemeli regex yerine): işaret + rakamlar + en fazla bir nokta, en az bir rakam.
  const body = s.replace(/^[-+]/, "");
  if (!/^[\d.]+$/.test(body) || body.split(".").length > 2 || !/\d/.test(body)) return undefined;
  const value = Number(s);
  return Number.isFinite(value) ? value : undefined;
}

/** Yazarken izin verilen karakterler (rakam, işaret, ayraçlar) — harf vb. hiç girmesin. */
export function isAllowedInput(text: string, locale: string): boolean {
  const { decimal, group } = getSeparators(locale);
  const escape = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^[-+]?[\\d${escape(decimal)}${escape(group)}.\\s]*$`).test(text);
}

/** `step` adımı sonrası değer: boş alanda min'den (yoksa 0'dan) başlar, sınırlar ve yuvarlar. */
export function stepValue(current: number | null, direction: 1 | -1, step: number, min: number | undefined, max: number | undefined, precision: number | undefined): number {
  const base = current ?? (direction === 1 ? (min ?? 0) - step : (max ?? 0) + step);
  // Adımın kendi ondalık basamağı kadar yuvarla ki 0.1 adımlar 0.30000000000000004 üretmesin.
  const stepDecimals = (String(step).split(".")[1] ?? "").length;
  const next = roundTo(base + direction * step, precision ?? Math.max(stepDecimals, decimals(base)));
  return clamp(next, min, max);
}

function decimals(value: number): number {
  return (String(value).split(".")[1] ?? "").length;
}
