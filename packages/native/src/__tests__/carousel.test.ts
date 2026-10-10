import { describe, expect, it } from "vitest";
import { canLoop, cloneCount, computeSnaps, loopTarget, nearestSnap, releaseSnap, responsiveSlides, slidesInView, stepSnap, wrap } from "../Carousel/utils";

describe("Carousel utils", () => {
  it("responsiveSlides: genişliği karşılayan en küçük kural", () => {
    const r = [
      { breakpoint: 1024, slidesToShow: 3 },
      { breakpoint: 480, slidesToShow: 1 },
    ];
    expect(responsiveSlides(4, 2, r, 390)).toEqual({ slidesToShow: 1, slidesToScroll: 1 });
    expect(responsiveSlides(4, 2, r, 800)).toEqual({ slidesToShow: 3, slidesToScroll: 3 });
    expect(responsiveSlides(4, 2, r, 1200)).toEqual({ slidesToShow: 4, slidesToScroll: 2 });
    expect(responsiveSlides(2, undefined, undefined, 300)).toEqual({ slidesToShow: 2, slidesToScroll: 2 });
  });

  it("canLoop: görünenden fazla slayt gerekir", () => {
    expect(canLoop(true, 3, 3)).toBe(false);
    expect(canLoop(true, 4, 3)).toBe(true);
    expect(canLoop(false, 9, 1)).toBe(false);
  });

  it("computeSnaps: döngüsüz trimSnaps uçta kırpar ve tekrarı atar", () => {
    expect(computeSnaps({ count: 5, show: 1, scroll: 1, loop: false })).toEqual([0, 1, 2, 3, 4]);
    expect(computeSnaps({ count: 6, show: 4, scroll: 2, loop: false })).toEqual([0, 2]);
    expect(computeSnaps({ count: 6, show: 3, scroll: 3, loop: false })).toEqual([0, 3]);
    expect(computeSnaps({ count: 5, show: 3, scroll: 1, loop: false, align: "center" })).toEqual([0, 1, 2]);
    expect(computeSnaps({ count: 6, show: 4, scroll: 2, loop: true })).toEqual([0, 2, 4]);
    expect(computeSnaps({ count: 0, show: 1, scroll: 1, loop: false })).toEqual([]);
  });

  it("wrap / loopTarget: en kısa yön, sondan ileri kopyaya", () => {
    expect(wrap(-1, 5)).toBe(4);
    expect(wrap(6, 5)).toBe(1);
    expect(loopTarget(4, 0, 5)).toBe(5);
    expect(loopTarget(0, 4, 5)).toBe(-1);
    expect(loopTarget(1, 2, 5)).toBe(2);
  });

  it("nearestSnap: döngüde dairesel uzaklık", () => {
    expect(nearestSnap([0, 1, 2, 3, 4], 4.6, true, 5)).toBe(0);
    expect(nearestSnap([0, 1, 2, 3, 4], 4.6, false, 5)).toBe(4);
  });

  it("releaseSnap: uzak/hızlı sürüklemede bir adım, kısa sürüklemede geri", () => {
    const snaps = [0, 1, 2];
    const base = { snaps, start: 1, slideWidth: 300, loop: false, count: 3 };
    expect(releaseSnap({ ...base, pos: 1.1, dx: -30, vx: 0.05 })).toBe(1);
    expect(releaseSnap({ ...base, pos: 1.3, dx: -90, vx: 0.05 })).toBe(2);
    expect(releaseSnap({ ...base, pos: 0.93, dx: 25, vx: 0.8 })).toBe(0);
    expect(releaseSnap({ ...base, pos: 0.95, dx: 15, vx: 0.8 })).toBe(1);
    expect(releaseSnap({ ...base, start: 2, pos: 2.3, dx: -90, vx: 0 })).toBe(2);
    expect(releaseSnap({ ...base, start: 2, pos: 2.3, dx: -90, vx: 0, loop: true })).toBe(0);
  });

  it("stepSnap / cloneCount", () => {
    expect(stepSnap(2, 1, 3, true)).toBe(0);
    expect(stepSnap(2, 1, 3, false)).toBe(2);
    expect(stepSnap(0, -1, 3, true)).toBe(2);
    expect(cloneCount(1, 1, 5)).toBe(2);
    expect(cloneCount(3, 3, 4)).toBe(4);
  });

  it("slidesInView: yarısından fazlası görünenler", () => {
    expect([...slidesInView(0, 1, 5, false)]).toEqual([0]);
    expect([...slidesInView(0.4, 1, 5, false)]).toEqual([0]);
    expect([...slidesInView(4.6, 1, 5, true)].sort()).toEqual([0]);
    expect([...slidesInView(1, 3, 6, false)].sort()).toEqual([1, 2, 3]);
  });
});
