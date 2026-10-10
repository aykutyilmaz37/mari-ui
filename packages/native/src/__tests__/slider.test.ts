import { describe, expect, it } from "vitest";
import { fillSpan, nearestThumb, snap, stepValue, thumbBounds, toRatio, valueFromOffset } from "../Slider/utils";

describe("Slider", () => {
  it("adıma oturtur ve sınırlar; ondalık artık kalmaz", () => {
    expect(snap(37, 0, 100, 5)).toBe(35);
    expect(snap(38, 0, 100, 5)).toBe(40);
    expect(snap(120, 0, 100, 1)).toBe(100);
    expect(snap(21.3, 16, 30, 0.5)).toBe(21.5);
    // 0.1 + 0.2 = 0.30000000000000004 → ızgaraya oturunca artık kalmaz.
    expect(String(snap(0.1 + 0.2, 0, 1, 0.1))).toBe("0.3");
  });
  it("dolgu tutamaç merkezlerine uzanır", () => {
    expect(fillSpan([86], 28, 228, false)).toEqual([0, 100]);
    expect(fillSpan([86], 28, 228, true)).toEqual([100, 228]);
    expect(fillSpan([10, 50], 28, 228, false)).toEqual([24, 64]);
  });
  it("tutamaç ray içinde kalır: uçlar thumb/2'de", () => {
    // uzunluk 228, tutamaç 28 → kullanılabilir 200
    expect(valueFromOffset(14, 228, 28, 0, 100, false)).toBe(0);
    expect(valueFromOffset(114, 228, 28, 0, 100, false)).toBe(50);
    expect(valueFromOffset(0, 228, 28, 0, 100, false)).toBe(0);
    expect(valueFromOffset(300, 228, 28, 0, 100, false)).toBe(100);
    // dikeyde aşağıdan yukarı
    expect(valueFromOffset(14, 228, 28, 0, 100, true)).toBe(100);
  });
  it("en yakın tutamaç; üst üsteyken yöne göre", () => {
    expect(nearestThumb([20, 80], 30)).toBe(0);
    expect(nearestThumb([20, 80], 70)).toBe(1);
    expect(nearestThumb([50, 50], 60)).toBe(1);
    expect(nearestThumb([50, 50], 40)).toBe(0);
  });
  it("aralıkta tutamaçlar birbirini geçmez", () => {
    expect(thumbBounds([20, 80], 0, 0, 100)).toEqual([0, 80]);
    expect(thumbBounds([20, 80], 1, 0, 100)).toEqual([20, 100]);
    expect(stepValue(80, 1, 5, 20, 80)).toBe(80);
    expect(toRatio(25, 0, 100)).toBe(0.25);
  });
});
