import { describe, expect, it } from "vitest";
import {
  addMonths,
  cellGridKeyStep,
  dayGridKeyStep,
  formatDate,
  fullDateLabel,
  getISOWeek,
  getMonthGrid,
  isBetweenDays,
  isSameDay,
  monthNames,
  parseDate,
  startOfWeek,
  weekdayNames,
} from "./index";

const D = (y: number, m: number, d: number, H = 0, i = 0) => new Date(y, m - 1, d, H, i);

describe("date engine", () => {
  it("addMonths ayın son gününe çeker; yıl geçişi", () => {
    expect(isSameDay(addMonths(D(2026, 1, 31), 1), D(2026, 2, 28))).toBe(true);
    expect(isSameDay(addMonths(D(2024, 1, 31), 1), D(2024, 2, 29))).toBe(true);
    expect(isSameDay(addMonths(D(2026, 12, 15), 1), D(2027, 1, 15))).toBe(true);
    expect(isSameDay(addMonths(D(2026, 1, 15), -1), D(2025, 12, 15))).toBe(true);
  });

  it("ay ızgarası 6×7, Pazartesi başlar; Pazar başlangıcı da", () => {
    const grid = getMonthGrid(2026, 9); // Ekim 2026: 1 Ekim Perşembe
    expect(grid).toHaveLength(6);
    expect(isSameDay(grid[0]![0], D(2026, 9, 28))).toBe(true);
    expect(grid[0]![0]!.getDay()).toBe(1);
    expect(getMonthGrid(2026, 9, 0)[0]![0]!.getDay()).toBe(0);
    expect(isSameDay(startOfWeek(D(2026, 10, 4)), D(2026, 9, 28))).toBe(true); // Pazar → önceki Pazartesi
  });

  it("Türkçe adlar ve tam etiket", () => {
    expect(monthNames()[9]).toBe("Ekim");
    expect(weekdayNames()[0]).toBe("Pzt");
    expect(weekdayNames("tr-TR", 1, "narrow")).toHaveLength(7);
    expect(fullDateLabel(D(2026, 10, 1))).toBe("1 Ekim 2026 Perşembe");
  });

  it("formatDate belirteçleri", () => {
    const d = D(2026, 3, 5, 9, 7);
    expect(formatDate(d, "dd.MM.yyyy")).toBe("05.03.2026");
    expect(formatDate(d, "d MMMM yyyy, EEEE HH:mm")).toBe("5 Mart 2026, Perşembe 09:07");
    expect(formatDate(d, "yyyy-MM-dd'T'")).toBe("2026-03-05'T'");
  });

  it("parseDate: kesin; ayraçlar esnek; tek hane; geçersiz → null; desende olmayan alanlar referanstan", () => {
    expect(parseDate("05.03.2026", "dd.MM.yyyy")?.getTime()).toBe(D(2026, 3, 5).getTime());
    expect(parseDate("5/3/2026", "dd.MM.yyyy")?.getTime()).toBe(D(2026, 3, 5).getTime());
    expect(parseDate("31.02.2026", "dd.MM.yyyy")).toBeNull();
    expect(parseDate("29.02.2024", "dd.MM.yyyy")).not.toBeNull();
    expect(parseDate("12.13.2026", "dd.MM.yyyy")).toBeNull();
    expect(parseDate("abc", "dd.MM.yyyy")).toBeNull();
    expect(parseDate("14:30", "HH:mm", D(2026, 10, 1))?.getTime()).toBe(D(2026, 10, 1, 14, 30).getTime());
    expect(parseDate("24:00", "HH:mm")).toBeNull();
    expect(parseDate("05.03.2026 09:07", "dd.MM.yyyy HH:mm")?.getTime()).toBe(D(2026, 3, 5, 9, 7).getTime());
    expect(parseDate("5 Mart 2026", "d MMMM yyyy")).toBeNull();
  });

  it("isBetweenDays sıra bağımsız, uçlar dahil", () => {
    expect(isBetweenDays(D(2026, 1, 5), D(2026, 1, 10), D(2026, 1, 1))).toBe(true);
    expect(isBetweenDays(D(2026, 1, 10, 23), D(2026, 1, 1), D(2026, 1, 10))).toBe(true);
    expect(isBetweenDays(D(2026, 1, 11), D(2026, 1, 1), D(2026, 1, 10))).toBe(false);
  });

  it("ISO hafta", () => {
    expect(getISOWeek(D(2026, 1, 1))).toBe(1);
    expect(getISOWeek(D(2027, 1, 1))).toBe(53);
    expect(getISOWeek(D(2026, 10, 1))).toBe(40);
  });

  it("klavye adımları", () => {
    const d = D(2026, 10, 1);
    expect(isSameDay(dayGridKeyStep(d, "ArrowUp", false), D(2026, 9, 24))).toBe(true);
    expect(isSameDay(dayGridKeyStep(d, "End", false), D(2026, 10, 4))).toBe(true);
    expect(isSameDay(dayGridKeyStep(d, "PageDown", true), D(2027, 10, 1))).toBe(true);
    expect(dayGridKeyStep(d, "a", false)).toBeNull();
    expect(cellGridKeyStep(4, "ArrowUp")).toBe(1);
    expect(cellGridKeyStep(4, "End")).toBe(5);
    expect(cellGridKeyStep(4, "x")).toBeNull();
  });
});
