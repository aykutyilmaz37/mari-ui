import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme, resolveThemeConfig } from "../theme";
import { meetsAA } from "../contrast";

describe("resolveThemeConfig", () => {
  it("boş config: lightTheme/darkTheme ile BİREBİR aynı sonucu üretir (regresyon — override yoksa davranış değişmemeli)", () => {
    const resolved = resolveThemeConfig();
    expect(resolved.light).toEqual(lightTheme);
    expect(resolved.dark).toEqual(darkTheme);
    expect(resolved.radiusDensity).toBe("md");
  });

  it("color.primary verilirse SADECE primary değişir, accent/success/... aynı kalır", () => {
    const resolved = resolveThemeConfig({ color: { primary: "#7c3aed" } });
    expect(resolved.light.color.primary).not.toEqual(lightTheme.color.primary);
    expect(resolved.light.color.accent).toEqual(lightTheme.color.accent);
    expect(resolved.light.color.success).toEqual(lightTheme.color.success);
  });

  it("keyfi bir anchor renk için bile solid/solidContrast çifti WCAG AA'yı geçer (stüdyonun asıl garantisi)", () => {
    // Turuncuya yakın, kontrastı zor bir renk deniyoruz — tam da madde 8'in
    // orijinal accent'inde (#F97316) yaşanan sorunun aynısı.
    const resolved = resolveThemeConfig({ color: { primary: "#fbbf24" } });
    for (const mode of [resolved.light, resolved.dark]) {
      const { solid, solidContrast } = mode.color.primary;
      expect(meetsAA(solid, solidContrast)).toBe(true);
    }
  });

  it("typography.fontFamilySans/Mono override edilirse temaya yansır, edilmezse varsayılan kalır", () => {
    const resolved = resolveThemeConfig({ typography: { fontFamilySans: "Inter, sans-serif" } });
    expect(resolved.light.fontFamily.sans).toBe("Inter, sans-serif");
    expect(resolved.light.fontFamily.mono).toBe(lightTheme.fontFamily.mono);
  });

  it("density.radius verilmezse 'md' varsayılanına döner, verilirse aynen taşınır", () => {
    expect(resolveThemeConfig().radiusDensity).toBe("md");
    expect(resolveThemeConfig({ density: { radius: "lg" } }).radiusDensity).toBe("lg");
  });

  it("light ve dark aynı config'den ayrı ayrı, kendi mode'larına uygun üretilir", () => {
    const resolved = resolveThemeConfig({ color: { accent: "#0ea5e9" } });
    expect(resolved.light.mode).toBe("light");
    expect(resolved.dark.mode).toBe("dark");
    expect(resolved.light.color.accent).not.toEqual(resolved.dark.color.accent);
  });
});
