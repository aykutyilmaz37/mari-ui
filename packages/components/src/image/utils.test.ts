import { describe, expect, it } from "vitest";
import { getBoxStyle, normalizeSource, resolveBlurSource, resolveImage } from "./utils";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  const q = quality ? `&q=${quality}` : "";
  return `https://cdn.x${src}?w=${width}${q}`;
};

describe("normalizeSource", () => {
  it("boş kaynakları eler", () => {
    expect(normalizeSource(null)).toBeNull();
    expect(normalizeSource("")).toBeNull();
    expect(normalizeSource({ src: "" })).toBeNull();
  });
  it("string ve statik kaynağı aynı şekle getirir", () => {
    expect(normalizeSource("/a.jpg")).toEqual({ src: "/a.jpg" });
    expect(normalizeSource({ src: "/a.jpg", width: 10, height: 5 })).toEqual({ src: "/a.jpg", width: 10, height: 5 });
  });
});

describe("resolveImage", () => {
  it("loader yoksa kaynağı olduğu gibi kullanır", () => {
    expect(resolveImage({ src: "/a.jpg" }, {})).toEqual({ src: "/a.jpg" });
  });
  it("sayısal genişlikte 1x/2x üretir", () => {
    expect(resolveImage({ src: "/a.jpg" }, { loader, width: 200 })).toEqual({
      src: "https://cdn.x/a.jpg?w=200",
      srcSet: "https://cdn.x/a.jpg?w=200 1x, https://cdn.x/a.jpg?w=400 2x",
    });
  });
  it("aksi halde sıralı genişlik adayları üretir", () => {
    const r = resolveImage({ src: "/a.jpg" }, { loader, widths: [800, 400, 400], quality: 70 });
    expect(r.src).toBe("https://cdn.x/a.jpg?w=800&q=70");
    expect(r.srcSet).toBe("https://cdn.x/a.jpg?w=400&q=70 400w, https://cdn.x/a.jpg?w=800&q=70 800w");
  });
});

describe("resolveBlurSource", () => {
  it("string doğrudan kullanılır", () => {
    expect(resolveBlurSource("/tiny.jpg", { src: "/a.jpg" }, undefined)).toBe("/tiny.jpg");
  });
  it("true: blurDataURL → loader küçük boy → null", () => {
    expect(resolveBlurSource(true, { src: "/a.jpg", blurDataURL: "data:x" }, loader)).toBe("data:x");
    expect(resolveBlurSource(true, { src: "/a.jpg" }, loader)).toBe("https://cdn.x/a.jpg?w=24&q=30");
    expect(resolveBlurSource(true, { src: "/a.jpg" }, undefined)).toBeNull();
  });
  it("false/node bulanık kaynak üretmez", () => {
    expect(resolveBlurSource(false, { src: "/a.jpg", blurDataURL: "data:x" }, loader)).toBeNull();
  });
});

describe("getBoxStyle", () => {
  it("sayısal genişlik/yükseklikten oran çıkarır, yükseklik orandan gelir", () => {
    expect(getBoxStyle({ width: 200, height: 100 })).toEqual({ width: "200px", aspectRatio: "200 / 100" });
  });
  it("yalnız oran: kabın genişliği", () => {
    expect(getBoxStyle({ aspectRatio: "4/3" })).toEqual({ width: "100%", aspectRatio: "4/3" });
  });
  it("boyut yoksa statik kaynağın oranı", () => {
    expect(getBoxStyle({ source: { src: "/a", width: 1600, height: 900 } })).toEqual({ width: "100%", aspectRatio: "1600 / 900" });
  });
  it("string uzunluklar olduğu gibi", () => {
    expect(getBoxStyle({ width: "100%", height: "12rem" })).toEqual({ width: "100%", height: "12rem" });
  });
});
