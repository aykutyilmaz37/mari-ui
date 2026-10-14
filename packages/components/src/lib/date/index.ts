/**
 * Calendar / DatePicker / TimePicker'ın ortak tarih motoru.
 * Bağımlılık yok: yerel `Date` + `Intl` (varsayılan yerel `tr-TR`). Tüm
 * hesaplar YEREL saatte; gün karşılaştırmaları saat bileşenini yok sayar.
 */

export const DEFAULT_LOCALE = "tr-TR";
/** Haftanın ilk günü: 1 = Pazartesi (Türkiye), 0 = Pazar. */
export type WeekStart = 0 | 1;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Ay ekler; hedef ayda o gün yoksa ayın son gününe çeker (31 Ocak + 1 ay = 28/29 Şubat). */
export function addMonths(d: Date, n: number): Date {
  const total = d.getFullYear() * 12 + d.getMonth() + n;
  const year = Math.floor(total / 12);
  const month = total - year * 12;
  const day = Math.min(d.getDate(), daysInMonth(year, month));
  return new Date(year, month, day, d.getHours(), d.getMinutes(), d.getSeconds());
}

export const addYears = (d: Date, n: number) => addMonths(d, n * 12);

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const isSameMonth = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
export const isSameYear = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear();

/** Gün düzeyinde karşılaştırma: <0, 0, >0. */
export const compareDay = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();

/** `d`, `a` ile `b` arasında mı (gün düzeyinde, uçlar dahil, sıra fark etmez). */
export function isBetweenDays(d: Date, a: Date, b: Date): boolean {
  const [lo, hi] = compareDay(a, b) <= 0 ? [a, b] : [b, a];
  return compareDay(d, lo) >= 0 && compareDay(d, hi) <= 0;
}

export function startOfWeek(d: Date, weekStart: WeekStart = 1): Date {
  const diff = (d.getDay() - weekStart + 7) % 7;
  return startOfDay(addDays(d, -diff));
}

export const endOfWeek = (d: Date, weekStart: WeekStart = 1) => addDays(startOfWeek(d, weekStart), 6);

/** Ay görünümü: her zaman 6 hafta × 7 gün (yükseklik aydan aya zıplamasın). */
export function getMonthGrid(year: number, month: number, weekStart: WeekStart = 1): Date[][] {
  const first = startOfWeek(new Date(year, month, 1), weekStart);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i)));
}

/** ISO 8601 hafta numarası (Pazartesi başlangıç; yılın ilk Perşembesini içeren hafta 1). */
export function getISOWeek(d: Date): number {
  const t = startOfDay(d);
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const firstThursday = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

/* ─────────────────────────── Yerel adlar ─────────────────────────── */

export function monthNames(locale = DEFAULT_LOCALE, width: "long" | "short" = "long"): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month: width });
  return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2024, m, 1)));
}

/** Haftanın günleri, `weekStart`tan başlayarak. */
export function weekdayNames(locale = DEFAULT_LOCALE, weekStart: WeekStart = 1, width: "long" | "short" | "narrow" = "short"): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: width });
  // 2024-01-07 bir Pazar.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + ((i + weekStart) % 7))));
}

/** Ekran okuyucu için tam tarih: "1 Ekim 2026 Perşembe". */
export function fullDateLabel(d: Date, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(d);
}

/* ─────────────────────────── Biçim / ayrıştırma ─────────────────────────── */

/**
 * Desteklenen belirteçler: `yyyy`, `MM`, `M`, `dd`, `d`, `HH`, `H`, `mm`,
 * `ss`, `MMMM` (ay adı), `MMM` (kısa ay adı), `EEEE`/`EEE` (gün adı).
 * Diğer karakterler olduğu gibi yazılır.
 */
const TOKEN_RE = /yyyy|MMMM|MMM|MM|M|dd|d|HH|H|mm|ss|EEEE|EEE/g;

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

export function formatDate(d: Date, pattern: string, locale = DEFAULT_LOCALE): string {
  return pattern.replace(TOKEN_RE, (token) => {
    switch (token) {
      case "yyyy":
        return pad(d.getFullYear(), 4);
      case "MMMM":
        return monthNames(locale, "long")[d.getMonth()]!;
      case "MMM":
        return monthNames(locale, "short")[d.getMonth()]!;
      case "MM":
        return pad(d.getMonth() + 1);
      case "M":
        return String(d.getMonth() + 1);
      case "dd":
        return pad(d.getDate());
      case "d":
        return String(d.getDate());
      case "HH":
        return pad(d.getHours());
      case "H":
        return String(d.getHours());
      case "mm":
        return pad(d.getMinutes());
      case "ss":
        return pad(d.getSeconds());
      case "EEEE":
        return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
      default:
        return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
    }
  });
}

const NUMERIC: Record<string, string> = { yyyy: "(\\d{4})", MM: "(\\d{1,2})", M: "(\\d{1,2})", dd: "(\\d{1,2})", d: "(\\d{1,2})", HH: "(\\d{1,2})", H: "(\\d{1,2})", mm: "(\\d{1,2})", ss: "(\\d{1,2})" };
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Sayısal desenle yazılmış metni çözer (ay/gün adı içeren desen çözülmez).
 * Kesin: 31.02.2026 gibi var olmayan tarih `null`. Desende olmayan alanlar
 * `reference`tan (varsayılan: bugün 00:00) alınır. Ayraç olarak `.`, `/`, `-`
 * birbirinin yerine kabul edilir; tek haneli gün/ay (1.2.2026) da olur.
 */
export function parseDate(text: string, pattern: string, reference: Date = startOfDay(new Date())): Date | null {
  const tokens: string[] = [];
  let re = "";
  let last = 0;
  for (const m of pattern.matchAll(TOKEN_RE)) {
    const literal = pattern.slice(last, m.index);
    re += escapeRe(literal).replace(/\\\.|\/|-/g, "[./-]");
    const group = NUMERIC[m[0]];
    if (!group) return null;
    re += group;
    tokens.push(m[0]);
    last = m.index! + m[0].length;
  }
  re += escapeRe(pattern.slice(last)).replace(/\\\.|\/|-/g, "[./-]");
  const match = new RegExp(`^\\s*${re}\\s*$`).exec(text);
  if (!match) return null;
  const parts = { y: reference.getFullYear(), M: reference.getMonth() + 1, d: reference.getDate(), H: reference.getHours(), m: reference.getMinutes(), s: reference.getSeconds() };
  tokens.forEach((t, i) => {
    const v = Number(match[i + 1]);
    if (t === "yyyy") parts.y = v;
    else if (t.startsWith("M")) parts.M = v;
    else if (t.startsWith("d")) parts.d = v;
    else if (t.startsWith("H")) parts.H = v;
    else if (t === "mm") parts.m = v;
    else parts.s = v;
  });
  if (parts.M < 1 || parts.M > 12 || parts.d < 1 || parts.d > daysInMonth(parts.y, parts.M - 1)) return null;
  if (parts.H > 23 || parts.m > 59 || parts.s > 59) return null;
  return new Date(parts.y, parts.M - 1, parts.d, parts.H, parts.m, parts.s);
}

/* ─────────────────────────── Klavye (APG date grid) ─────────────────────────── */

/**
 * ←/→ gün, ↑/↓ hafta, Home/End haftanın başı/sonu, PageUp/PageDown ay
 * (Shift ile yıl). Tanınmayan tuş → `null`.
 */
export function dayGridKeyStep(d: Date, key: string, shift: boolean, weekStart: WeekStart = 1): Date | null {
  switch (key) {
    case "ArrowLeft":
      return addDays(d, -1);
    case "ArrowRight":
      return addDays(d, 1);
    case "ArrowUp":
      return addDays(d, -7);
    case "ArrowDown":
      return addDays(d, 7);
    case "Home":
      return startOfWeek(d, weekStart);
    case "End":
      return endOfWeek(d, weekStart);
    case "PageUp":
      return shift ? addYears(d, -1) : addMonths(d, -1);
    case "PageDown":
      return shift ? addYears(d, 1) : addMonths(d, 1);
    default:
      return null;
  }
}

/** Ay/yıl ızgarası (3 sütun): ←/→ ±1, ↑/↓ ±3, Home/End satır başı/sonu. Değer bir indekstir. */
export function cellGridKeyStep(index: number, key: string, columns = 3): number | null {
  const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
  if (key in map) return index + map[key]!;
  if (key === "Home") return index - (index % columns);
  if (key === "End") return index - (index % columns) + columns - 1;
  return null;
}

/** Sınırlar içinde mi (gün düzeyinde). */
export function isWithin(d: Date, min?: Date | null, max?: Date | null): boolean {
  if (min && compareDay(d, min) < 0) return false;
  if (max && compareDay(d, max) > 0) return false;
  return true;
}
