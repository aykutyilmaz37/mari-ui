import { describe, expect, it } from "vitest";
import { bandScale, extent, linearScale, niceDomain, tickStep } from "./scale";
import { arcPath, areaPath, linePath, polar } from "./paths";

describe("scale", () => {
  it("tickStep 1/2/5 × 10ⁿ", () => {
    expect(tickStep(0, 100, 5)).toBe(20);
    expect(tickStep(0, 1, 5)).toBeCloseTo(0.2);
    expect(tickStep(0, 7300, 5)).toBe(2000);
  });

  it("niceDomain veriyi yuvarlak sınırlara genişletir", () => {
    expect(niceDomain(3, 97)).toEqual({ min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100] });
    expect(niceDomain(-12, 38).ticks).toEqual([-20, -10, 0, 10, 20, 30, 40]);
    expect(niceDomain(0, 0.7).ticks).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
  });

  it("niceDomain eşit değerlerde aralığı açar", () => {
    const d = niceDomain(50, 50);
    expect(d.min).toBeLessThan(50);
    expect(d.max).toBeGreaterThan(50);
  });

  it("linearScale ters aralıkla (SVG y)", () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(100)).toBe(0);
    expect(y(25)).toBe(150);
  });

  it("bandScale eşit bantlar, merkez", () => {
    const x = bandScale(4, [0, 400], 0.5);
    expect(x.bandwidth).toBe(50);
    expect(x(0)).toBe(25);
    expect(x.center(3)).toBe(350);
  });

  it("extent null/NaN atlar", () => {
    expect(extent([3, null, 9, Number.NaN, -1])).toEqual([-1, 9]);
    expect(extent([])).toEqual([0, 0]);
  });
});

describe("paths", () => {
  it("linePath null değerde çizgiyi böler", () => {
    expect(linePath([[0, 0], [10, 10], null, [30, 0], [40, 5]])).toBe("M0,0L10,10M30,0L40,5");
  });

  it("smooth eğri noktalardan geçer ve tek noktalı segmentte çökmez", () => {
    const d = linePath([[0, 10], [10, 0], [20, 10]], "smooth");
    expect(d.startsWith("M0,10C")).toBe(true);
    expect(d.endsWith("20,10")).toBe(true);
    expect(linePath([[5, 5]], "smooth")).toBe("M5,5");
  });

  it("smooth eğri monoton veride taşma yapmaz (kontrol noktaları aralıkta)", () => {
    const d = linePath([[0, 100], [10, 50], [20, 0], [30, 0]], "smooth");
    // Yol: komut harfleri + "x,y" çiftleri; y = her çiftin ikincisi.
    const nums = d.split(/[MLC]/).filter(Boolean).flatMap((part) => part.split(",").map(Number));
    const ys = nums.filter((_, i) => i % 2 === 1);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
  });

  it("areaPath tabana kapanır", () => {
    expect(areaPath([[0, 5], [10, 2]], 20)).toBe("M0,5L10,2L10,20L0,20Z");
  });

  it("polar: 0 = saat 12", () => {
    const [x, y] = polar(50, 50, 10, 0);
    expect([Math.round(x), Math.round(y)]).toEqual([50, 40]);
  });

  it("arcPath tam turu iki yayla çizer, sıfır açıda boş", () => {
    expect(arcPath(0, 0, 10, 5, 0, Math.PI * 2).match(/A/g)?.length).toBe(4);
    expect(arcPath(0, 0, 10, 0, 1, 1)).toBe("");
  });
});
