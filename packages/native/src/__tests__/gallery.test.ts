import { describe, expect, it } from "vitest";
import {
  autoColumns,
  buildLayout,
  drillDownTarget,
  formatDuration,
  groupItems,
  sectionLabel,
} from "../ImageGallery/galleryUtils";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);
const items = [
  { id: "a", date: d(2026, 10, 2) },
  { id: "b", date: d(2026, 10, 2) },
  { id: "c", date: d(2026, 10, 1) },
  { id: "d", date: d(2026, 9, 20) },
  { id: "e", date: d(2025, 12, 31) },
];
const getDate = (i: { date: Date }) => i.date;

describe("groupItems", () => {
  it("görünüme göre bölümler, düz dizinler bölüm sırasında", () => {
    expect(groupItems(items, "day", getDate).map((s) => s.entries.length)).toEqual([2, 1, 1, 1]);
    expect(groupItems(items, "month", getDate).map((s) => s.key)).toEqual(["2026-10", "2026-09", "2025-12"]);
    expect(groupItems(items, "year", getDate).map((s) => s.entries.map((e) => e.index))).toEqual([[0, 1, 2, 3], [4]]);
    expect(groupItems(items, "all", getDate)).toHaveLength(1);
  });

  it("ayrık aynı anahtarlı öğe ilk bölüme toplanır; düz sıra bölümleri izler", () => {
    const mixed = [items[0]!, items[4]!, items[1]!];
    const sections = groupItems(mixed, "year", getDate);
    expect(sections.map((s) => s.entries.map((e) => [e.item.id, e.index]))).toEqual([
      [
        ["a", 0],
        ["b", 1],
      ],
      [["e", 2]],
    ]);
  });
});

describe("autoColumns", () => {
  it("gün iri, yıl sık; en az 2", () => {
    expect(autoColumns(375, "day", 2)).toBe(2);
    expect(autoColumns(375, "all", 2)).toBe(3);
    expect(autoColumns(375, "year", 2)).toBe(5);
    expect(autoColumns(100, "day", 2)).toBe(2);
    expect(autoColumns(5000, "year", 2)).toBe(16);
  });
});

describe("buildLayout", () => {
  const sections = groupItems(items, "month", getDate); // 4 + 1 + ... → [3,1,1]
  const layout = buildLayout(sections, { width: 302, columns: 2, gap: 2, headerHeight: 44 });

  it("başlık + öğe satırları, hücre kare", () => {
    expect(layout.cell).toBe(150);
    expect(layout.rows.map((r) => r.kind)).toEqual(["header", "items", "items", "header", "items", "header", "items"]);
    expect(layout.rows.map((r) => r.top)).toEqual([0, 44, 196, 346, 390, 540, 584]);
    expect(layout.height).toBe(734);
    expect(layout.rowOf).toEqual([1, 1, 2, 4, 6]);
  });

  it("başlıksız (all) bölümler arası boşluk", () => {
    const flat = buildLayout(groupItems(items, "all", getDate), { width: 302, columns: 2, gap: 2, headerHeight: 0 });
    expect(flat.rows.map((r) => r.top)).toEqual([0, 152, 304]);
    expect(flat.height).toBe(454);
  });

});

describe("drillDownTarget", () => {
  it("yıl → ay; bölümün ilk öğesinin yeni dizini", () => {
    const sections = groupItems(items, "year", getDate);
    expect(drillDownTarget(items, sections, "year", 1, getDate)).toEqual({ view: "month", index: 4 });
    expect(drillDownTarget(items, groupItems(items, "day", getDate), "day", 0, getDate)).toBeNull();
  });
});

describe("biçimler", () => {
  it("süre", () => {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(75)).toBe("1:15");
    expect(formatDuration(3725)).toBe("1:02:05");
  });

  it("bölüm başlığı: Bugün / Dün / tarih", () => {
    const now = d(2026, 10, 2);
    expect(sectionLabel(d(2026, 10, 2), "day", "tr-TR", now)).toBe("Bugün");
    expect(sectionLabel(d(2026, 10, 1), "day", "tr-TR", now)).toBe("Dün");
    expect(sectionLabel(d(2026, 9, 28), "day", "tr-TR", now)).toBe("28 Eylül Pazartesi");
    expect(sectionLabel(d(2025, 9, 28), "day", "tr-TR", now)).toContain("2025");
    expect(sectionLabel(d(2026, 9, 28), "month", "tr-TR", now)).toBe("Eylül 2026");
    expect(sectionLabel(d(2026, 9, 28), "year", "tr-TR", now)).toBe("2026");
    expect(sectionLabel(null, "day")).toBe("Tarihsiz");
  });

});
