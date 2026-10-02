/**
 * Faz 16.7 — ImageGallery'nin saf mantığı: tarihe göre bölümleme, sütun
 * sayısı, sanal yerleşim (satır konumları), görünür aralık ve ızgara tuşları.
 * DOM'a dokunmaz → test edilebilir.
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

/** `[viewTop, viewBottom]` (galeriye göre px) ile kesişen satırlar + her iki yanda `overscan` satır. */
export function visibleRows(rows: readonly GalleryRow[], viewTop: number, viewBottom: number, overscan = 2): [number, number] {
  if (!rows.length || viewBottom <= viewTop) return [0, -1];
  // İlk `top + height > viewTop` satırı (ikili arama).
  let lo = 0;
  let hi = rows.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const r = rows[mid]!;
    if (r.top + r.height > viewTop) hi = mid;
    else lo = mid + 1;
  }
  let last = lo;
  while (last + 1 < rows.length && rows[last + 1]!.top < viewBottom) last++;
  if (rows[lo]!.top >= viewBottom) return [Math.max(0, lo - overscan), Math.min(rows.length - 1, lo + overscan)];
  return [Math.max(0, lo - overscan), Math.min(rows.length - 1, last + overscan)];
}

/** Render edilecek satırlar: görünen aralık + (dışındaysa) odaktaki satır — odak sanallaştırmada kaybolmasın. */
export function renderedRows([first, last]: [number, number], total: number, activeRow: number | undefined): number[] {
  const rows: number[] = [];
  for (let r = first; r <= last && r < total; r++) rows.push(r);
  if (activeRow !== undefined && (activeRow < first || activeRow > last)) rows.push(activeRow);
  return rows;
}

/**
 * Izgara tuşları → yeni düz dizin. ←/→ sıradaki öğe (bölüm sınırını aşar),
 * ↑/↓ aynı sütun bir üst/alt öğe satırı (bölüm atlanırsa sütun kısalan
 * satıra kırpılır), Home/End satır başı/sonu, Ctrl+Home/End ilk/son,
 * PageUp/PageDown `pageRows` öğe satırı. Uygun değilse `null`.
 */
export function galleryKeyStep(layout: GalleryLayout, index: number, key: string, ctrl: boolean, pageRows = 3): number | null {
  const count = layout.rowOf.length;
  if (!count) return null;
  const itemRows = layout.rows.map((r, i) => (r.kind === "items" ? i : -1)).filter((i) => i >= 0);
  const rowAt = (n: number) => layout.rows[itemRows[n]!] as Extract<GalleryRow, { kind: "items" }>;
  const current = itemRows.indexOf(layout.rowOf[index]!);
  const row = rowAt(current);
  const col = index - row.start;
  const moveRows = (delta: number) => {
    const target = Math.min(itemRows.length - 1, Math.max(0, current + delta));
    if (target === current) return null;
    const r = rowAt(target);
    return Math.min(r.start + col, r.end - 1);
  };
  switch (key) {
    case "ArrowLeft":
      return index > 0 ? index - 1 : null;
    case "ArrowRight":
      return index < count - 1 ? index + 1 : null;
    case "ArrowUp":
      return moveRows(-1);
    case "ArrowDown":
      return moveRows(1);
    case "PageUp":
      return moveRows(-pageRows);
    case "PageDown":
      return moveRows(pageRows);
    case "Home":
      return ctrl ? 0 : row.start;
    case "End":
      return ctrl ? count - 1 : row.end - 1;
    default:
      return null;
  }
}

/** Hücrede basılan tuş: Enter/Space → `"activate"`, gezinme → yeni dizin, değilse `null`. */
export function gridKeyIntent(layout: GalleryLayout, index: number, key: string, ctrl: boolean, pageRows: number): "activate" | number | null {
  if (key === "Enter" || key === " ") return "activate";
  return galleryKeyStep(layout, index, key, ctrl, Math.max(1, pageRows));
}

/** Shift ile aralık seçimi: `anchor`..`index` (dahil) düz dizinleri. */
export function rangeIndexes(anchor: number, index: number): number[] {
  const [a, b] = anchor < index ? [anchor, index] : [index, anchor];
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
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
