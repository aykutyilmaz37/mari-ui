/**
 * ImageGallery'nin saf mantığı — web'deki (`components/src/image/galleryUtils.ts`)
 * ile birebir; klavye ızgarası ve görünür aralık hesabı yok (native'de FlatList
 * sanallaştırır, satır konumları `getItemLayout`a gider).
 */

export type GalleryView = "all" | "day" | "month" | "year";

export interface GalleryEntry<T> {
  item: T;
  /** Bölümlenmiş (düz) sıradaki yeri — görüntüleyici ve seçim bu sırayı kullanır. */
  index: number;
}

export interface GallerySection<T> {
  key: string;
  /** Bölümün ilk öğesinin tarihi (başlık için). Tarihsiz bölümde `null`. */
  date: Date | null;
  entries: GalleryEntry<T>[];
}

export function sectionKey(date: Date | null | undefined, view: GalleryView): string {
  if (view === "all") return "all";
  if (!date) return "none";
  const y = date.getFullYear();
  if (view === "year") return String(y);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  if (view === "month") return `${y}-${m}`;
  return `${y}-${m}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Öğeleri görünüme göre bölümler. Sıra korunur (tüketici zaten tarihe göre
 * sıralar); aynı anahtara düşen ayrık öğeler ilk görüldükleri bölüme toplanır.
 */
export function groupItems<T>(items: readonly T[], view: GalleryView, getDate: (item: T) => Date | null | undefined): GallerySection<T>[] {
  const map = new Map<string, GallerySection<T>>();
  for (const item of items) {
    const date = getDate(item) ?? null;
    const key = sectionKey(date, view);
    let section = map.get(key);
    if (!section) {
      section = { key, date, entries: [] };
      map.set(key, section);
    }
    section.entries.push({ item, index: 0 });
  }
  const sections = Array.from(map.values());
  let i = 0;
  for (const s of sections) for (const e of s.entries) e.index = i++;
  return sections;
}

/** Görünüme göre hedef küçük resim genişliği (px): gün iri, yıl sık — iPhone gibi. */
export const TARGET_TILE: Record<GalleryView, number> = { day: 160, all: 120, month: 100, year: 64 };
export const MIN_COLUMNS = 2;
export const MAX_COLUMNS = 16;

export const clampColumns = (n: number) => Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.round(n)));

export function autoColumns(width: number, view: GalleryView, gap: number): number {
  if (width <= 0) return 4;
  return clampColumns(Math.floor((width + gap) / (TARGET_TILE[view] + gap)));
}

export type GalleryRow =
  | { kind: "header"; section: number; top: number; height: number }
  /** `start`..`end` (dahil değil) düz dizinler. */
  | { kind: "items"; section: number; start: number; end: number; top: number; height: number };

export interface GalleryLayout {
  rows: GalleryRow[];
  height: number;
  cell: number;
  columns: number;
  /** Düz dizin → satır numarası. */
  rowOf: number[];
}

export function buildLayout(
  sections: readonly GallerySection<unknown>[],
  { width, columns, gap, headerHeight }: { width: number; columns: number; gap: number; headerHeight: number }
): GalleryLayout {
  const cell = Math.max(0, (width - gap * (columns - 1)) / columns);
  const rows: GalleryRow[] = [];
  const rowOf: number[] = [];
  let top = 0;
  sections.forEach((section, s) => {
    if (headerHeight > 0) {
      rows.push({ kind: "header", section: s, top, height: headerHeight });
      top += headerHeight;
    } else if (s > 0) {
      top += gap;
    }
    const first = section.entries[0]?.index ?? 0;
    for (let k = 0; k < section.entries.length; k += columns) {
      const start = first + k;
      const end = first + Math.min(k + columns, section.entries.length);
      for (let i = start; i < end; i++) rowOf[i] = rows.length;
      rows.push({ kind: "items", section: s, start, end, top, height: cell });
      top += cell + (k + columns < section.entries.length ? gap : 0);
    }
  });
  return { rows, height: top, cell, columns, rowOf };
}

/** Video süresi: 75 → "1:15", 3725 → "1:02:05". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Bölüm başlığı: gün → "Bugün" / "Dün" / "28 Eylül 2026 Pazartesi", ay → "Eylül 2026", yıl → "2026". */
export function sectionLabel(date: Date | null, view: GalleryView, locale = "tr-TR", now = new Date()): string {
  if (!date) return "Tarihsiz";
  if (view === "year") return String(date.getFullYear());
  if (view === "month") return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
  if (sameDay(date, now)) return "Bugün";
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (sameDay(date, yesterday)) return "Dün";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  }).format(date);
}

/** Bir üst görünümün başlığına tıklayınca inilecek görünüm (yıl → ay → gün). */
export const DRILL_DOWN: Partial<Record<GalleryView, GalleryView>> = { year: "month", month: "day" };

/**
 * Üst görünümde bir bölüm başlığına tıklanınca: inilecek görünüm ve o
 * bölümün ilk öğesinin YENİ görünümdeki düz dizini (yeniden bölümlemede
 * sıra değişebilir → anahtar yerine öğenin kendisiyle bulunur).
 */
export function drillDownTarget<T>(
  items: readonly T[],
  sections: readonly GallerySection<T>[],
  view: GalleryView,
  sectionIndex: number,
  getDate: (item: T) => Date | null | undefined
): { view: GalleryView; index: number } | null {
  const next = DRILL_DOWN[view];
  const first = sections[sectionIndex]?.entries[0]?.item;
  if (!next || first === undefined) return null;
  const regrouped = groupItems(items, next, getDate).flatMap((s) => s.entries);
  const hit = regrouped.find((e) => e.item === first);
  return { view: next, index: hit?.index ?? 0 };
}
