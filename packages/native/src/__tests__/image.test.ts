import { describe, expect, it } from "vitest";
import { getBoxStyle, imageButtonRole, normalizeSource, parseRatio, pickWidth, resizeModeFor, resolveBlurSource, resolveUri } from "../Image/utils";

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}`;

describe("Image utils", () => {
  it("normalizeSource: boş kaynak null", () => {
    expect(normalizeSource("")).toBeNull();
    expect(normalizeSource(undefined)).toBeNull();
    expect(normalizeSource({ src: "" })).toBeNull();
    expect(normalizeSource("a.jpg")).toEqual({ src: "a.jpg" });
  });

  it("pickWidth: hedefi karşılayan en küçük aday, yoksa en büyük", () => {
    expect(pickWidth(700, [384, 640, 828])).toBe(828);
    expect(pickWidth(640, [640, 384])).toBe(640);
    expect(pickWidth(5000, [384, 640])).toBe(640);
  });

  it("resolveUri: loader yoksa kaynak; sayısal genişlik × oran; ölçülmeden null", () => {
    const s = { src: "a.jpg" };
    expect(resolveUri(s, { pixelRatio: 3 })).toBe("a.jpg");
    expect(resolveUri(s, { loader, width: 100, pixelRatio: 3 })).toBe("a.jpg?w=300");
    expect(resolveUri(s, { loader, pixelRatio: 3 })).toBeNull();
    expect(resolveUri(s, { loader, layoutWidth: 343, pixelRatio: 3 })).toBe("a.jpg?w=1080");
  });

  it("resolveBlurSource: string → o, true → blurDataURL ya da loader küçük boyu", () => {
    expect(resolveBlurSource("b.jpg", { src: "a.jpg" }, undefined)).toBe("b.jpg");
    expect(resolveBlurSource(true, { src: "a.jpg", blurDataURL: "data:x" }, loader)).toBe("data:x");
    expect(resolveBlurSource(true, { src: "a.jpg" }, loader)).toBe("a.jpg?w=24");
    expect(resolveBlurSource(true, { src: "a.jpg" }, undefined)).toBeNull();
    expect(resolveBlurSource(undefined, { src: "a.jpg", blurDataURL: "data:x" }, loader)).toBeNull();
  });

  it("parseRatio", () => {
    expect(parseRatio("16 / 9")).toBeCloseTo(16 / 9);
    expect(parseRatio("1.5")).toBe(1.5);
    expect(parseRatio(2)).toBe(2);
    expect(parseRatio("x")).toBeUndefined();
    expect(parseRatio(0)).toBeUndefined();
  });

  it("getBoxStyle: oran önceliği ve tahmini 4:3", () => {
    expect(getBoxStyle({ aspectRatio: "2/1" })).toEqual({ style: { width: "100%", aspectRatio: 2 }, estimated: false });
    expect(getBoxStyle({ width: 200, height: 100 })).toEqual({ style: { width: 200, aspectRatio: 2 }, estimated: false });
    expect(getBoxStyle({ width: "50%", height: 100 })).toEqual({ style: { width: "50%", height: 100 }, estimated: false });
    expect(getBoxStyle({ height: 120, aspectRatio: 1 })).toEqual({ style: { height: 120, aspectRatio: 1 }, estimated: false });
    expect(getBoxStyle({ source: { width: 300, height: 100 } }).style.aspectRatio).toBe(3);
    expect(getBoxStyle({})).toEqual({ style: { width: "100%", aspectRatio: 4 / 3 }, estimated: true });
    expect(getBoxStyle({ natural: { width: 100, height: 200 } })).toEqual({ style: { width: "100%", aspectRatio: 0.5 }, estimated: false });
  });

  it("resizeModeFor: scale-down küçük görselde ortada, büyükte contain", () => {
    expect(resizeModeFor("fill")).toBe("stretch");
    expect(resizeModeFor("none")).toBe("center");
    expect(resizeModeFor("scale-down", { width: 50, height: 50 }, { width: 100, height: 100 })).toBe("center");
    expect(resizeModeFor("scale-down", { width: 500, height: 50 }, { width: 100, height: 100 })).toBe("contain");
    expect(resizeModeFor("cover")).toBe("cover");
  });
});

describe("imageButtonRole", () => {
  it("web'de button, cihazda imagebutton", () => {
    expect(imageButtonRole("web")).toBe("button");
    expect(imageButtonRole("ios")).toBe("imagebutton");
  });
});
