import { describe, expect, it } from "vitest";
import { createAssetResolver, isAbsoluteUrl } from "../asset";

describe("createAssetResolver", () => {
  it("ayar yoksa yolu kökten döndürür", () => {
    const asset = createAssetResolver();
    expect(asset("img/a.png")).toBe("/img/a.png");
    expect(asset("/img/a.png")).toBe("/img/a.png");
  });

  it("boş/null yol boş string döner", () => {
    const asset = createAssetResolver({ cdnUrl: "https://cdn.x" });
    expect(asset("")).toBe("");
    expect(asset(null)).toBe("");
    expect(asset(undefined)).toBe("");
  });

  it("assetPrefix ekler, fazladan eğik çizgileri temizler", () => {
    const asset = createAssetResolver({ assetPrefix: "bo-web-assets//" });
    expect(asset("a.png")).toBe("/bo-web-assets/a.png");
  });

  it("cdnUrl ile önekli tam URL üretir", () => {
    const asset = createAssetResolver({ assetPrefix: "/assets", cdnUrl: "https://cdn.x/" });
    expect(asset("/a.png")).toBe("https://cdn.x/assets/a.png");
    expect(createAssetResolver({ cdnUrl: "https://cdn.x" })("a.png")).toBe("https://cdn.x/a.png");
  });

  it("absolute: absoluteBase kullanır, önek/CDN atlanır", () => {
    const asset = createAssetResolver({
      assetPrefix: "/assets",
      cdnUrl: "https://cdn.x",
      absoluteBase: "https://img.x/",
    });
    expect(asset("p/1.jpg", { absolute: true })).toBe("https://img.x/p/1.jpg");
  });

  it.each([
    "https://a.com/x.png",
    "mailto:a@b.com",
    "//a.com/x.png",
    "data:image/png;base64,AAAA",
    "blob:https://a.com/1234",
  ])("tam adrese dokunmaz: %s", (url) => {
    const asset = createAssetResolver({ assetPrefix: "/assets", cdnUrl: "https://cdn.x" });
    expect(asset(url)).toBe(url);
    expect(asset(url, { absolute: true })).toBe(url);
  });

  it("sorgu ve hash korunur", () => {
    const asset = createAssetResolver({ cdnUrl: "https://cdn.x" });
    expect(asset("/a.png?w=200#x")).toBe("https://cdn.x/a.png?w=200#x");
  });
});

describe("isAbsoluteUrl", () => {
  it("göreli yolları ayırt eder", () => {
    expect(isAbsoluteUrl("/a.png")).toBe(false);
    expect(isAbsoluteUrl("a.png")).toBe(false);
    expect(isAbsoluteUrl("https://a")).toBe(true);
  });
});
