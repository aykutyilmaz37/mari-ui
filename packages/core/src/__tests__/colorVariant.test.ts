import { describe, expect, it } from "vitest";
import { resolveColorVariant } from "../variants/colorVariant";

describe("resolveColorVariant", () => {
  it("solid: background+foreground+hoverBackground aynı role bağlanır", () => {
    const style = resolveColorVariant("primary", "solid");
    expect(style.background).toEqual({ role: "primary", slot: "solid" });
    expect(style.foreground).toEqual({ role: "primary", slot: "solidContrast" });
    expect(style.hoverBackground).toEqual({ role: "primary", slot: "solidHover" });
    expect(style.border).toBeUndefined();
  });

  it("outline: sadece foreground+border döner, background yok", () => {
    const style = resolveColorVariant("error", "outline");
    expect(style.background).toBeUndefined();
    expect(style.foreground).toEqual({ role: "error", slot: "text" });
    expect(style.border).toEqual({ role: "error", slot: "border" });
  });

  it("soft: subtle arka plan + subtleContrast metin", () => {
    const style = resolveColorVariant("accent", "soft");
    expect(style.background).toEqual({ role: "accent", slot: "subtle" });
    expect(style.foreground).toEqual({ role: "accent", slot: "subtleContrast" });
  });

  it("ghost ve link: sadece foreground, background/border yok", () => {
    for (const variant of ["ghost", "link"] as const) {
      const style = resolveColorVariant("info", variant);
      expect(style.background).toBeUndefined();
      expect(style.border).toBeUndefined();
      expect(style.foreground).toEqual({ role: "info", slot: "text" });
    }
  });

  it("tüm renk rolleri için tutarlı davranır (regresyon: 5 farklı prop adı yerine tek eksen)", () => {
    const roles = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
    for (const role of roles) {
      const style = resolveColorVariant(role, "solid");
      expect(style.background?.role).toBe(role);
    }
  });
});
