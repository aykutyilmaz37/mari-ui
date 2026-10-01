import { describe, expect, it } from "vitest";
import { defaultFormat, formatPlaceholder, isoValue, orderRange, rangePosition, snap, columnValues } from "./utils";

const D = (y: number, m: number, d: number, H = 0, i = 0) => new Date(y, m - 1, d, H, i);

describe("DatePicker utils", () => {
  it("varsayılan biçimler ve Türkçe yer tutucu", () => {
    expect(defaultFormat("date", "date")).toBe("dd.MM.yyyy");
    expect(defaultFormat("datetime", "date", true)).toBe("dd.MM.yyyy HH:mm:ss");
    expect(defaultFormat("date", "month")).toBe("MM.yyyy");
    expect(formatPlaceholder("dd.MM.yyyy HH:mm:ss")).toBe("gg.aa.yyyy ss:dd:sn");
  });

  it("isoValue gizli alan için", () => {
    expect(isoValue(D(2026, 3, 5, 9, 7), "date")).toBe("2026-03-05");
    expect(isoValue(D(2026, 3, 5, 9, 7), "time")).toBe("09:07");
    expect(isoValue(D(2026, 3, 5, 9, 7), "datetime")).toBe("2026-03-05T09:07");
    expect(isoValue(null, "date")).toBe("");
  });

  it("rangePosition: uçlar, orta, hover önizlemesi, tek gün", () => {
    const a = D(2026, 10, 5);
    const b = D(2026, 10, 9);
    expect(rangePosition(D(2026, 10, 5), a, b, null)).toBe("start");
    expect(rangePosition(D(2026, 10, 7), a, b, null)).toBe("middle");
    expect(rangePosition(D(2026, 10, 9), a, b, null)).toBe("end");
    expect(rangePosition(D(2026, 10, 10), a, b, null)).toBeNull();
    expect(rangePosition(D(2026, 10, 3), a, null, D(2026, 10, 2))).toBe("middle");
    expect(rangePosition(D(2026, 10, 5), a, null, null)).toBe("single");
  });

  it("orderRange, adım yardımcıları", () => {
    expect(orderRange(D(2026, 1, 9), D(2026, 1, 5))).toEqual([D(2026, 1, 5), D(2026, 1, 9)]);
    expect(columnValues(59, 15)).toEqual([0, 15, 30, 45]);
    expect(snap(37, 15)).toBe(30);
  });
});
