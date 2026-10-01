import { describe, expect, it } from "vitest";
import { areaKeyStep, colorInfo, describeColor, formatColor, hsbToRgb, isLight, parseColor, ratioFromPointer, rgbToHsb, sameColor, sliderKeyStep } from "./utils";

describe("ColorPicker utils", () => {
  it("hex: 3/4/6/8 hane, # isteğe bağlı, büyük/küçük harf", () => {
    expect(colorInfo(parseColor("#f00")!).hex).toBe("#ff0000");
    expect(colorInfo(parseColor("1677FF")!).hex).toBe("#1677ff");
    expect(parseColor("#1677ff80")!.a).toBeCloseTo(0.502, 2);
    expect(parseColor("#0f08")!.a).toBeCloseTo(0.533, 2);
    expect(parseColor("#12345")).toBeNull();
    expect(parseColor("mavi")).toBeNull();
    expect(parseColor("")).toBeNull();
  });

  it("rgb/rgba: virgüllü ve modern boşluklu yazım, yüzde alfa", () => {
    expect(colorInfo(parseColor("rgb(22, 119, 255)")!).hex).toBe("#1677ff");
    expect(parseColor("rgba(0,0,0,0.25)")!.a).toBe(0.25);
    expect(parseColor("rgb(0 0 0 / 50%)")!.a).toBe(0.5);
    expect(colorInfo(parseColor("rgb(100%, 0%, 0%)")!).hex).toBe("#ff0000");
    expect(parseColor("rgb(1, 2)")).toBeNull();
  });

  it("hsb tonu olduğu gibi korur (gri renkte bile); hsl de kabul edilir", () => {
    expect(parseColor("hsb(200, 0%, 50%)")).toEqual({ h: 200, s: 0, b: 50, a: 1 });
    expect(parseColor("hsba(-30, 120, 50, 0.4)")).toEqual({ h: 330, s: 100, b: 50, a: 0.4 });
    expect(colorInfo(parseColor("hsl(0, 100%, 50%)")!).hex).toBe("#ff0000");
    expect(colorInfo(parseColor("hsl(120 100% 25%)")!).hex).toBe("#008000");
  });

  it("RGB ↔ HSB gidiş-dönüş", () => {
    for (const hex of ["#1677ff", "#2f66a3", "#000000", "#ffffff", "#7f7f7f", "#e11d48"]) {
      const rgb = hsbToRgb(parseColor(hex)!);
      expect(colorInfo(rgbToHsb(rgb)).hex).toBe(hex);
    }
  });

  it("biçimler: alfa < 1 ise rgba/hsba/8 haneli hex", () => {
    const c = parseColor("#1677ff")!;
    expect(formatColor(c, "rgb")).toBe("rgb(22, 119, 255)");
    expect(formatColor(c, "hsb")).toBe("hsb(215, 91%, 100%)");
    const half = { ...c, a: 0.5 };
    expect(formatColor(half, "hex")).toBe("#1677ff80");
    expect(formatColor(half, "rgb")).toBe("rgba(22, 119, 255, 0.5)");
    expect(formatColor(half, "hsb")).toBe("hsba(215, 91%, 100%, 0.5)");
  });

  it("sameColor 8 bit hex ile karşılaştırır; null yalnız null'a eşit", () => {
    expect(sameColor(parseColor("#1677ff"), parseColor("rgb(22,119,255)"))).toBe(true);
    expect(sameColor(parseColor("#1677ff"), parseColor("#1677fe"))).toBe(false);
    expect(sameColor(null, null)).toBe(true);
    expect(sameColor(null, parseColor("#000"))).toBe(false);
  });

  it("isLight: sarı/beyaz açık, lacivert koyu, çok saydam açık sayılır", () => {
    expect(isLight(parseColor("#ffffff")!)).toBe(true);
    expect(isLight(parseColor("#facc15")!)).toBe(true);
    expect(isLight(parseColor("#1e3a8a")!)).toBe(false);
    expect(isLight({ ...parseColor("#000")!, a: 0.2 })).toBe(true);
  });

  it("describeColor ekran okuyucu metni", () => {
    expect(describeColor(parseColor("#1677ff"))).toBe("#1677ff");
    expect(describeColor(parseColor("rgba(22,119,255,0.5)"))).toBe("#1677ff, opaklık %50");
    expect(describeColor(null)).toBe("Renk yok");
  });

  it("2B alan klavyesi: ←/→ doygunluk, ↑/↓ parlaklık, Shift 10, sınırlarda kesilir", () => {
    expect(areaKeyStep("ArrowRight", false, 50, 50)).toEqual({ s: 51, b: 50 });
    expect(areaKeyStep("ArrowDown", true, 50, 5)).toEqual({ s: 50, b: 0 });
    expect(areaKeyStep("Home", false, 50, 50)).toEqual({ s: 0, b: 50 });
    expect(areaKeyStep("PageUp", false, 50, 50)).toEqual({ s: 50, b: 100 });
    expect(areaKeyStep("a", false, 50, 50)).toBeNull();
  });

  it("kaydırıcı klavyesi", () => {
    expect(sliderKeyStep("ArrowLeft", false, 10, 0, 360, 1)).toBe(9);
    expect(sliderKeyStep("ArrowUp", true, 355, 0, 360, 1)).toBe(360);
    expect(sliderKeyStep("PageDown", false, 50, 0, 100, 1)).toBe(40);
    expect(sliderKeyStep("End", false, 50, 0, 100, 1)).toBe(100);
    expect(sliderKeyStep("Enter", false, 50, 0, 100, 1)).toBeNull();
  });

  it("işaretçi oranı kutuya göre 0–1 arasında", () => {
    const rect = { left: 10, top: 20, width: 100, height: 50 };
    expect(ratioFromPointer(60, 45, rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(ratioFromPointer(-5, 200, rect)).toEqual({ x: 0, y: 1 });
  });
});
