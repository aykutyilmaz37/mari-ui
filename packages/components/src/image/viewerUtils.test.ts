import { describe, expect, it } from "vitest";
import {
  IDENTITY,
  MAX_SCALE,
  clampPan,
  containSize,
  dismissProgress,
  dragIntent,
  originTransform,
  shouldDismiss,
  swipeOutcome,
  toggleZoom,
  visibleSlides,
  zoomAround,
} from "./viewerUtils";

const base = { width: 400, height: 300 };
const stage = { width: 400, height: 600 };

describe("clampPan", () => {
  it("ölçek 1'de kaydırmaya izin vermez", () => {
    expect(clampPan({ scale: 1, x: 50, y: -40 }, base, stage)).toEqual({ scale: 1, x: 0, y: 0 });
  });
  it("taşan kadar kaydırır", () => {
    // 2x: 800x600 → yatay taşma 200, dikey taşma 0
    expect(clampPan({ scale: 2, x: 999, y: 999 }, base, stage)).toEqual({ scale: 2, x: 200, y: 0 });
  });
});

describe("zoomAround", () => {
  it("merkezde yakınlaşma kaydırma üretmez", () => {
    expect(zoomAround(IDENTITY, 2, { x: 0, y: 0 }, base, stage)).toEqual({ scale: 2, x: 0, y: 0 });
  });
  it("imlecin altındaki nokta sabit kalır", () => {
    const v = zoomAround(IDENTITY, 2, { x: 100, y: 0 }, base, stage);
    // içerik noktası (100 - x)/scale aynı kalmalı: (100 - (-100))/2 = 100
    expect(v.x).toBe(-100);
  });
  it("ölçeği sınırlar, 1'e inince sıfırlar", () => {
    expect(zoomAround(IDENTITY, 99, { x: 0, y: 0 }, base, stage).scale).toBe(MAX_SCALE);
    expect(zoomAround({ scale: 2, x: 100, y: 0 }, 0.5, { x: 0, y: 0 }, base, stage)).toEqual(IDENTITY);
  });
});

describe("toggleZoom", () => {
  it("yakın değilse yakınlaşır, yakınsa sıfırlar", () => {
    expect(toggleZoom(IDENTITY, { x: 0, y: 0 }, base, stage).scale).toBeGreaterThan(1);
    expect(toggleZoom({ scale: 2, x: 10, y: 0 }, { x: 0, y: 0 }, base, stage)).toEqual(IDENTITY);
  });
});

describe("swipeOutcome", () => {
  it("uzak ya da hızlı sürükleme yön değiştirir", () => {
    expect(swipeOutcome(-150, 0, 400)).toBe(1);
    expect(swipeOutcome(150, 0, 400)).toBe(-1);
    expect(swipeOutcome(-40, -0.8, 400)).toBe(1);
  });
  it("kısa ve yavaş sürükleme yerine döner", () => {
    expect(swipeOutcome(-40, -0.1, 400)).toBe(0);
    expect(swipeOutcome(-10, -2, 400)).toBe(0);
  });
});

describe("kapatma", () => {
  it("ilerleme 0..1 aralığında", () => {
    expect(dismissProgress(-50, 600)).toBe(0);
    expect(dismissProgress(150, 600)).toBe(0.5);
    expect(dismissProgress(9999, 600)).toBe(1);
  });
  it("yeterince aşağı ya da hızlı çekilince kapanır", () => {
    expect(shouldDismiss(120, 0, 600)).toBe(true);
    expect(shouldDismiss(40, 0.9, 600)).toBe(true);
    expect(shouldDismiss(40, 0.1, 600)).toBe(false);
  });
});

describe("dragIntent", () => {
  it("küçük harekette karar vermez", () => expect(dragIntent(3, 4)).toBeNull());
  it("yatay → kaydırma, aşağı → kapatma, yukarı → kaydırma", () => {
    expect(dragIntent(30, 5)).toBe("swipe");
    expect(dragIntent(5, 30)).toBe("dismiss");
    expect(dragIntent(5, -30)).toBe("swipe");
  });
});

describe("originTransform", () => {
  it("kaynak kutunun merkezine ve kaplayan ölçeğe götürür", () => {
    const t = originTransform({ left: 0, top: 0, width: 100, height: 100 }, { left: 0, top: 150, width: 400, height: 300 });
    expect(t).toEqual({ x: -150, y: -250, scale: 1 / 3 });
  });
});

describe("visibleSlides", () => {
  it("komşuları sınırlarda keser", () => {
    expect(visibleSlides(0, 3)).toEqual([0, 1]);
    expect(visibleSlides(1, 3)).toEqual([0, 1, 2]);
    expect(visibleSlides(0, 1)).toEqual([0]);
  });
});

describe("containSize", () => {
  it("oranı koruyarak sahneye sığdırır", () => {
    expect(containSize({ width: 2000, height: 1000 }, { width: 400, height: 600 })).toEqual({ width: 400, height: 200 });
    expect(containSize({ width: 100, height: 100 }, { width: 400, height: 600 }, false)).toEqual({ width: 100, height: 100 });
  });
  it("boyut bilinmiyorsa sahneyi döner", () => {
    expect(containSize({ width: 0, height: 0 }, stage)).toEqual(stage);
  });
});
