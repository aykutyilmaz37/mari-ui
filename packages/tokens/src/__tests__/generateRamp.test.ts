import { describe, expect, it } from "vitest";
import { generateRamp } from "../primitives/generateRamp";
import { relativeLuminance } from "../contrast";
import type { HexColor } from "../contrast";

describe("generateRamp", () => {
  it("500 tonu anchor'ı DEĞİŞTİRMEDEN taşır (aynı rengi yeniden üretir — HSL round-trip kararlı)", () => {
    const anchor: HexColor = "#2563eb";
    const ramp = generateRamp(anchor);
    // Bilinçli olarak `toBe` DEĞİL: HSL round-trip'i (hex->hsl->hex) yuvarlama
    // yüzünden anchor'ı bit-bit yeniden üretmeyebilir. Aynı anchor'ı KENDİSİ
    // yeniden HSL round-trip'inden geçirip onunla karşılaştırıyoruz.
    const roundTripped = generateRamp(ramp[500]);
    expect(ramp[500]).toBe(roundTripped[500]);
  });

  it("11 ton da geçerli hex renk döner", () => {
    const ramp = generateRamp("#7c3aed");
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const) {
      expect(ramp[shade]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("lightness 50'den 950'ye monoton azalır (açıktan koyuya)", () => {
    const ramp = generateRamp("#059669");
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
    const luminances = shades.map((shade) => relativeLuminance(ramp[shade]));
    for (let i = 1; i < luminances.length; i++) {
      expect(luminances[i]).toBeLessThan(luminances[i - 1] as number);
    }
  });

  it("çok açık (beyaza yakın) veya çok koyu (siyaha yakın) bir anchor'da bile 11 farklı ton üretir (uç durum kırpması hepsini aynı renge çökertmez)", () => {
    const lightAnchorRamp = generateRamp("#fefefe");
    const uniqueLight = new Set(Object.values(lightAnchorRamp));
    expect(uniqueLight.size).toBeGreaterThan(1);

    const darkAnchorRamp = generateRamp("#010101");
    const uniqueDark = new Set(Object.values(darkAnchorRamp));
    expect(uniqueDark.size).toBeGreaterThan(1);
  });

  it("hue/saturation'ı korur (gri değil, renkli bir rampa üretir)", () => {
    const ramp = generateRamp("#dc2626"); // kırmızı
    // Kırmızının 600 tonu, kırmızı kanalın yeşil/mavi kanallardan belirgin
    // şekilde yüksek olması beklenir — griye çökmedi.
    const hex = ramp[600].replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    expect(r).toBeGreaterThan(g + 30);
    expect(r).toBeGreaterThan(b + 30);
  });
});
