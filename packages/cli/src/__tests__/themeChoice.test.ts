import { describe, expect, it } from "vitest";
import { defaultThemeConfig, resolveThemeConfig } from "@mari-ui/tokens";
import { choiceFromFlags, configFromChoice, describeConfig, isHexColor, parsePersonaFlag } from "../themeChoice";

describe("configFromChoice", () => {
  it("varsayılan: Yumuşak iris değerlerini açıkça yazar, kişilik yok", () => {
    const config = configFromChoice({ kind: "default" });
    expect(config.persona).toBeUndefined();
    expect(config.color).toEqual(defaultThemeConfig.color);
    expect(config.density).toEqual(defaultThemeConfig.density);
  });

  it("kişilik: yalnız { persona } — her şey kişilikten gelir", () => {
    expect(configFromChoice({ kind: "persona", name: "editorial" })).toEqual({ persona: "editorial" });
  });

  it("özel: renkler küçük harfe, verilmeyen vurgu/köşe/yoğunluk varsayılandan", () => {
    const config = configFromChoice({ kind: "custom", primary: "#0F766E" });
    expect(config.color).toEqual({ primary: "#0f766e", accent: defaultThemeConfig.color.accent });
    expect(config.density).toMatchObject({ radius: defaultThemeConfig.density.radius, spacing: defaultThemeConfig.density.spacing });
    // Gerçekten çözülebilir bir tema üretir.
    expect(resolveThemeConfig(config).light.color.primary.solid).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("tema değişince ek temalar ve büyük ekran ayarı korunur, eski tema alanları silinir", () => {
    const current = {
      persona: "luxury" as const,
      color: { primary: "#111111" as const },
      scale: { fluid: true, max: 24 },
      themes: { marka: { base: "dark" as const } },
    };
    const config = configFromChoice({ kind: "persona", name: "minimal" }, current);
    expect(config).toEqual({ persona: "minimal", scale: { fluid: true, max: 24 }, themes: { marka: { base: "dark" } } });
  });
});

describe("bayraklar", () => {
  it("--persona default ve kişilik adlarını tanır, gerisini reddeder", () => {
    expect(parsePersonaFlag("default")).toBe("default");
    expect(parsePersonaFlag("minimal")).toBe("minimal");
    expect(parsePersonaFlag("mor")).toBeUndefined();
  });

  it("--primary özel tema yapar ve hex'i doğrular", () => {
    expect(choiceFromFlags({ primary: "#0f766e", accent: "#f59e0b" })).toEqual({ kind: "custom", primary: "#0f766e", accent: "#f59e0b" });
    expect(() => choiceFromFlags({ primary: "teal" })).toThrow(/hex/);
    expect(() => choiceFromFlags({ primary: "#0f766e", accent: "#abc" })).toThrow(/--accent/);
  });

  it("bayrak yoksa seçim yok (sihirbaz ya da mevcut config)", () => {
    expect(choiceFromFlags({})).toBeUndefined();
    expect(choiceFromFlags({ persona: "default" })).toEqual({ kind: "default" });
  });

  it("isHexColor yalnız 6 haneli hex kabul eder", () => {
    expect(isHexColor("#6951ce")).toBe(true);
    expect(isHexColor("6951ce")).toBe(false);
    expect(isHexColor("#fff")).toBe(false);
  });
});

describe("describeConfig", () => {
  it("kişiliği, özel rengi ya da varsayılanı adlandırır", () => {
    expect(describeConfig({ persona: "playful" })).toBe("Oyunbaz");
    expect(describeConfig({ color: { primary: "#0f766e" } })).toBe("Özel (#0f766e)");
    expect(describeConfig(defaultThemeConfig)).toBe("Varsayılan (Yumuşak iris)");
  });
});
