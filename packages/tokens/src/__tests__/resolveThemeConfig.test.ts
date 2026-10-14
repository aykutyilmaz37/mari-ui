import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme, resolveThemeConfig, defaultThemeConfig } from "../theme";
import { meetsAA } from "../contrast";
import { radius, scaleRadius } from "../primitives/scale";
import { themeToCssVariables } from "../cssVariables";

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

  it("scale: kapalıyken fluidRootMax null; açıkken max (varsayılan 22)", () => {
    expect(resolveThemeConfig().fluidRootMax).toBeNull();
    expect(resolveThemeConfig({ scale: { fluid: true } }).fluidRootMax).toBe(22);
    expect(resolveThemeConfig({ scale: { fluid: true, max: 26 } }).fluidRootMax).toBe(26);
    expect(resolveThemeConfig({ scale: { max: 26 } }).fluidRootMax).toBeNull();
  });

  it("density.spacing verilmezse 'normal', verilirse aynen taşınır", () => {
    expect(resolveThemeConfig().spacingDensity).toBe("normal");
    expect(resolveThemeConfig({ density: { spacing: "compact" } }).spacingDensity).toBe("compact");
  });

  it("light ve dark aynı config'den ayrı ayrı, kendi mode'larına uygun üretilir", () => {
    const resolved = resolveThemeConfig({ color: { accent: "#0ea5e9" } });
    expect(resolved.light.mode).toBe("light");
    expect(resolved.dark.mode).toBe("dark");
    expect(resolved.light.color.accent).not.toEqual(resolved.dark.color.accent);
  });

  it("light/dark her zaman name='light'/name='dark' taşır", () => {
    const resolved = resolveThemeConfig();
    expect(resolved.light.name).toBe("light");
    expect(resolved.dark.name).toBe("dark");
  });

  describe("Faz 10 — themes (3. tema desteği)", () => {
    it("themes verilmezse boş obje döner (opsiyonel, geriye dönük uyumlu)", () => {
      expect(resolveThemeConfig().themes).toEqual({});
    });

    it("her ek tema kendi ismini ve base'ini taşır, birbirinden bağımsız renk override'ı alabilir", () => {
      const resolved = resolveThemeConfig({
        themes: {
          brand: { base: "light", color: { primary: "#a21caf" } },
          highContrast: { base: "dark", color: { primary: "#facc15" } },
        },
      });
      expect(resolved.themes.brand?.name).toBe("brand");
      expect(resolved.themes.brand?.mode).toBe("light");
      expect(resolved.themes.highContrast?.name).toBe("highContrast");
      expect(resolved.themes.highContrast?.mode).toBe("dark");
      expect(resolved.themes.brand?.color.primary).not.toEqual(resolved.themes.highContrast?.color.primary);
    });

    it("ek temanın RENGİ üst seviyeden bağımsızdır", () => {
      const resolved = resolveThemeConfig({
        color: { primary: "#000000" },
        themes: { brand: { base: "light" } },
      });
      // `brand` kendi override'ını vermedi -> varsayılan primary'yi (üst seviyedeki #000000'ı DEĞİL) taşımalı.
      expect(resolved.themes.brand?.color.primary).toEqual(lightTheme.color.primary);
    });

    it("ek tema FONTU üst seviyeden (kişilik dahil) miras alır, kendi typography'si ezer", () => {
      const resolved = resolveThemeConfig({
        persona: "editorial",
        themes: { brand: { base: "light" }, mono: { base: "dark", typography: { fontFamilySans: "Courier" } } },
      });
      expect(resolved.themes.brand?.fontFamily).toEqual(resolved.light.fontFamily);
      expect(resolved.themes.brand?.fontFamily.sans).not.toEqual(lightTheme.fontFamily.sans);
      expect(resolved.themes.mono?.fontFamily.sans).toBe("Courier");
      expect(resolved.themes.mono?.fontFamily.heading).toEqual(resolved.light.fontFamily.heading);
    });
  });
});


it("CLI / stüdyo varsayılan config'i özgün iris rampalarını korur", () => {
  const resolved = resolveThemeConfig(defaultThemeConfig);
  expect(resolved.light).toEqual(lightTheme);
  expect(resolved.dark).toEqual(darkTheme);
});

it("özel primary odak halkasına da yansır", () => {
  const resolved = resolveThemeConfig({ color: { primary: "#0f766e" } });
  for (const theme of [resolved.light, resolved.dark]) {
    expect(theme.color.canvas.ring).toBe(theme.color.primary.text);
  }

  describe("density.radius (Faz 15 preset)", () => {
    it("md skalayı olduğu gibi bırakır", () => {
      expect(scaleRadius("md")).toEqual(radius);
    });

    it("none her şeyi 0 yapar, full'e dokunmaz", () => {
      expect(scaleRadius("none")).toEqual({ none: "0px", sm: "0px", md: "0px", lg: "0px", xl: "0px", full: radius.full });
    });

    it("sm yarıya, lg 1.5 katına ölçekler", () => {
      expect(scaleRadius("sm")).toMatchObject({ sm: "0.125rem", md: "0.25rem", lg: "0.375rem", xl: "0.5rem" });
      expect(scaleRadius("lg")).toMatchObject({ sm: "0.375rem", md: "0.75rem", lg: "1.125rem", xl: "1.5rem" });
    });

    it("light, dark ve isimli temaların hepsine ve CSS değişkenlerine yansır", () => {
      const resolved = resolveThemeConfig({ density: { radius: "none" }, themes: { brand: { base: "light" } } });
      expect(resolved.radiusDensity).toBe("none");
      for (const theme of [resolved.light, resolved.dark, resolved.themes.brand]) expect(theme?.radius.md).toBe("0px");
      expect(themeToCssVariables(resolved.light)["--mari-radius-lg"]).toBe("0px");
    });
  });
});
