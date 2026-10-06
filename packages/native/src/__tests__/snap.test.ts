import { describe, expect, it } from "vitest";
import { releaseTarget, resolveSnapPoints } from "../BottomSheet/snap";

describe("resolveSnapPoints", () => {
  it("yüzde ve pt karışık, sıralı, ekranın %95'i ile sınırlı", () => {
    expect(resolveSnapPoints(["90%", 200, "50%"], 800)).toEqual([200, 400, 720]);
    expect(resolveSnapPoints(["100%"], 800)).toEqual([760]);
    expect(resolveSnapPoints([300, 300], 800)).toEqual([300]);
  });
});

describe("releaseTarget", () => {
  const snaps = [300, 600];
  it("yavaş bırakmada en yakın durak", () => {
    expect(releaseTarget(560, 0, snaps)).toBe(1);
    expect(releaseTarget(380, 0, snaps)).toBe(0);
  });
  it("en alt durağın yeterince altına inince kapanır (closable)", () => {
    expect(releaseTarget(150, 0, snaps)).toBe(-1);
    expect(releaseTarget(150, 0, snaps, false)).toBe(0);
  });
  it("hızlı aşağı fırlatma bir alt durağa, en alttaysa kapatır", () => {
    expect(releaseTarget(590, 1.2, snaps)).toBe(0);
    expect(releaseTarget(290, 1.2, snaps)).toBe(-1);
  });
  it("hızlı yukarı fırlatma bir üst durağa, en üstteyse orada kalır", () => {
    expect(releaseTarget(320, -1.2, snaps)).toBe(1);
    expect(releaseTarget(600, -1.2, snaps)).toBe(1);
  });
});
