import { describe, expect, it } from "vitest";
import { contrastRatio, meetsAA, type HexColor } from "../contrast";
import { generateRamp } from "../primitives/generateRamp";
import { accessibleSolidShade, buildAccentRole, buildThemeVars } from "../runtimeTheme";
import { darkTheme, lightTheme, resolveThemeConfig } from "../theme";

const lightSurface = lightTheme.color.canvas.surface as HexColor;
const darkSurface = darkTheme.color.canvas.surface as HexColor;
const hardColors: HexColor[] = ["#facc15", "#a3e635", "#22d3ee", "#fde68a", "#1e3a8a", "#111827", "#f472b6"];

describe("accessibleSolidShade", () => {
  it("zemine karşı zaten 3:1 geçen tercih edilen tonu değiştirmez", () => {
    const ramp = generateRamp("#6951ce");
    expect(accessibleSolidShade(ramp, "light", [lightSurface])).toBe(600);
  });

  it("açık temada koyuya, koyu temada açığa doğru kayar", () => {
    const yellow = generateRamp("#facc15");
    expect(accessibleSolidShade(yellow, "light", [lightSurface])).toBeGreaterThan(600);
    const navy = generateRamp("#111827");
    expect(accessibleSolidShade(navy, "dark", [darkSurface])).toBeLessThan(400);
  });
});

describe("buildAccentRole", () => {
  it.each(hardColors)("%s: dolgu zemine ≥3:1, dolgu üstü metin ≥4.5:1 (iki modda)", (hex) => {
    for (const [mode, theme] of [["light", lightTheme], ["dark", darkTheme]] as const) {
      const role = buildAccentRole(hex, mode);
      expect(contrastRatio(role.solid, theme.color.canvas.surface as HexColor)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(role.solid, theme.color.canvas.surfaceAlt as HexColor)).toBeGreaterThanOrEqual(3);
      expect(meetsAA(role.solid, role.solidContrast)).toBe(true);
    }
  });

  it("düzeltme gerekmeyen renkte config yoluyla (resolveThemeConfig) aynı rolü üretir", () => {
    const resolved = resolveThemeConfig({ color: { primary: "#7c3aed" } });
    expect(buildAccentRole("#7c3aed", "light")).toEqual(resolved.light.color.primary);
  });
});

describe("buildThemeVars", () => {
  it("vurgu rengi yoksa boş — mod/yoğunluk stylesheet'ten gelir", () => {
    expect(buildThemeVars({}, "light")).toEqual({});
  });

  it("yalnız primary değişkenleri ve ring'i döndürür", () => {
    const vars = buildThemeVars({ primary: "#facc15" }, "light");
    expect(Object.keys(vars).sort((a, b) => a.localeCompare(b))).toEqual(
      [
        "--mari-color-primary",
        "--mari-color-primary-border",
        "--mari-color-primary-solid",
        "--mari-color-primary-solid-contrast",
        "--mari-color-primary-solid-hover",
        "--mari-color-primary-subtle",
        "--mari-color-primary-subtle-contrast",
        "--mari-color-ring",
      ].sort((a, b) => a.localeCompare(b))
    );
    expect(vars["--mari-color-ring"]).toBe(vars["--mari-color-primary"]);
  });

  it("moda göre farklı değer üretir", () => {
    expect(buildThemeVars({ primary: "#22d3ee" }, "light")["--mari-color-primary-solid"]).not.toBe(
      buildThemeVars({ primary: "#22d3ee" }, "dark")["--mari-color-primary-solid"]
    );
  });
});
