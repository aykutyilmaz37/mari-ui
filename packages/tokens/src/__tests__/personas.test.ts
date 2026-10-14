import { describe, expect, it } from "vitest";
import { applyPersona, minimizeConfig, personaFontsUrl, personaNames, personas } from "../personas";
import { scaleMotion, scaleShadow } from "../primitives/scale";
import { resolveThemeConfig } from "../theme";
import { meetsAA } from "../contrast";

describe("scaleShadow", () => {
  it("none tüm gölgeleri kaldırır, strong opaklığı iki katına çıkarır", () => {
    expect(Object.values(scaleShadow("none")).every((v) => v === "none")).toBe(true);
    expect(scaleShadow("strong").sm).toBe("0 1px 2px 0 rgb(0 0 0 / 0.1)");
    expect(scaleShadow("soft").md).toContain("/ 0.05)");
  });
});

describe("scaleMotion", () => {
  it("off süreleri sıfırlar, lively taşan eğri kullanır", () => {
    expect(scaleMotion("off").duration).toEqual({ fast: "0ms", normal: "0ms", slow: "0ms" });
    expect(scaleMotion("calm").duration.normal).toBe("350ms");
    expect(scaleMotion("lively").easing.standard).toContain("1.56");
  });
});

describe("applyPersona", () => {
  it("config'teki alan kişiliği ezer, yazılmayanlar kişilikten gelir", () => {
    const merged = applyPersona({ persona: "playful", color: { primary: "#0000ff" }, density: { radius: "sm" } });
    expect(merged.color).toEqual({ primary: "#0000ff", accent: personas.playful.config.color?.accent });
    expect(merged.density).toEqual({ radius: "sm", spacing: "comfortable", shadow: "strong" });
    expect(merged.motion).toBe("lively");
  });

  it("kişilik yoksa config aynen döner", () => {
    const config = { density: { radius: "lg" as const } };
    expect(applyPersona(config)).toBe(config);
  });
});

describe("kişilik temaları", () => {
  it.each(personaNames)("%s: tema çözülür, dolgu üstü metin AA'yı geçer", (name) => {
    const resolved = resolveThemeConfig({ persona: name });
    for (const theme of [resolved.light, resolved.dark]) {
      expect(theme.effects.shadow).toBe(personas[name].config.density?.shadow);
      expect(meetsAA(theme.color.primary.solidContrast, theme.color.primary.solid)).toBe(true);
    }
  });

  it("Google Fonts adresi boşlukları + ile kodlar", () => {
    expect(personaFontsUrl("playful")).toContain("family=Baloo+2:wght@500;600;700");
    expect(personaFontsUrl("editorial")).toContain("family=Source+Sans+3:wght@400;500;600;700");
  });
});

describe("minimizeConfig", () => {
  const defaults = { color: { primary: "#6951ce" as const, accent: "#765991" as const }, density: { radius: "md" as const, spacing: "normal" as const, shadow: "normal" as const }, motion: "normal" as const };

  it("kişilikle aynı alanları atar, farklı olanları tutar", () => {
    const full = applyPersona({ persona: "playful" });
    const minimized = minimizeConfig({ ...full, persona: "playful", density: { ...full.density, radius: "sm" } }, defaults);
    expect(minimized).toEqual({ persona: "playful", density: { radius: "sm" } });
  });

  it("kişilik yoksa config aynen döner", () => {
    const config = { density: { radius: "lg" as const } };
    expect(minimizeConfig(config, defaults)).toBe(config);
  });
});
