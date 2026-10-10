import { describe, expect, it } from "vitest";
import { rateValueAt, rateValueText, starFraction, stepRate } from "../Rate/utils";

const geo = { count: 5, size: 28, gap: 6, allowHalf: false };

describe("Rate", () => {
  it("dokunulan yıldızın puanını verir; boşluk önceki yıldıza sayılır", () => {
    expect(rateValueAt(0, geo)).toBe(1);
    expect(rateValueAt(30, geo)).toBe(1); // boşlukta
    expect(rateValueAt(34, geo)).toBe(2);
    expect(rateValueAt(500, geo)).toBe(5);
    expect(rateValueAt(-20, geo)).toBe(1);
  });
  it("yarım puanda sol yarı .5", () => {
    const half = { ...geo, allowHalf: true };
    expect(rateValueAt(10, half)).toBe(0.5);
    expect(rateValueAt(20, half)).toBe(1);
    expect(rateValueAt(34 + 5, half)).toBe(1.5);
  });
  it("yıldız doluluk oranı", () => {
    expect(starFraction(4.3, 4, false, true)).toBeCloseTo(0.3);
    expect(starFraction(4.3, 4, false, false)).toBe(0);
    expect(starFraction(3.5, 3, true, false)).toBe(0.5);
    expect(starFraction(3.5, 2, true, false)).toBe(1);
  });
  it("ekran okuyucu metni ve artır/azalt", () => {
    expect(rateValueText(4.5, 5)).toBe("4,5 / 5");
    expect(rateValueText(3, 5)).toBe("3 / 5");
    expect(stepRate(5, 1, 5, false)).toBe(5);
    expect(stepRate(0, -1, 5, true)).toBe(0);
    expect(stepRate(2, 1, 5, true)).toBe(2.5);
  });
});
