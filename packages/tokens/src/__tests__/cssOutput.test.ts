import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme, resolveThemeConfig, createNamedTheme } from "../theme";
import { buildPlainThemeCss, buildTailwindMappingCss, buildTailwindThemeCss, fluidRootFontSize } from "../cssOutput";

describe("fluidRootFontSize", () => {
  /** clamp'in orta terimini verilen genişlikte px'e çevirir (16px kök varsayımıyla). */
  const middleAt = (css: string, widthPx: number) => {
    const [, vw, rem] = /clamp\(100%, ([\d.]+)vw \+ ([\d.]+)rem, ([\d.]+)rem\)/.exec(css) ?? [];
    return (Number(vw) / 100) * widthPx + Number(rem) * 16;
  };

  it("1920px'te 16px, 3840px'te max px", () => {
    const css = fluidRootFontSize(22);
    expect(css).toBe("clamp(100%, 0.3125vw + 0.625rem, 1.375rem)");
    expect(middleAt(css, 1920)).toBeCloseTo(16);
    expect(middleAt(css, 3840)).toBeCloseTo(22);
  });

  it("max 16–32 aralığına sıkıştırılır", () => {
    expect(fluidRootFontSize(40)).toContain(", 2rem)");
    expect(fluidRootFontSize(10)).toBe(fluidRootFontSize(16));
  });
});

describe("buildPlainThemeCss", () => {
  it("fluidRootMax verilirse html font-size yazılır, verilmezse yazılmaz", () => {
    const themeSet = { default: lightTheme, named: { dark: darkTheme } };
    expect(buildPlainThemeCss(themeSet)).not.toContain("html {");
    expect(buildPlainThemeCss(themeSet, { fluidRootMax: null })).not.toContain("html {");
    expect(buildPlainThemeCss(themeSet, { fluidRootMax: 22 })).toContain(`html {\n  font-size: ${fluidRootFontSize(22)};\n}`);
  });

  it("spacingDensity: normal'de kural yok; diğerlerinde yalnız data-density yokken geçerli kök --spacing", () => {
    const themeSet = { default: lightTheme, named: { dark: darkTheme } };
    expect(buildPlainThemeCss(themeSet)).not.toContain("data-density");
    expect(buildPlainThemeCss(themeSet, { spacingDensity: "normal" })).not.toContain("data-density");

    const comfortable = buildPlainThemeCss(themeSet, { spacingDensity: "comfortable" });
    expect(comfortable).toContain(":root:not([data-density]) {\n  --spacing: 0.3rem;");
    expect(comfortable).not.toContain("pointer: coarse");

    // Sıkı dokunmatikte normale döner (44px dokunma hedefi), components styles.css ile aynı.
    const compact = buildPlainThemeCss(themeSet, { spacingDensity: "compact" });
    expect(compact).toContain(":root:not([data-density]) {\n  --spacing: 0.2rem;");
    expect(compact).toContain("(pointer: coarse) {\n  :root:not([data-density]) {\n    --spacing: 0.25rem;");
  });

  it(":root ve [data-theme=dark] bloklarının hepsini içerir", () => {
    const css = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme } });
    expect(css).toContain(":root {");
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  it("dark blok renk/font ailelerini taşır, spacing/radius'u TEKRARLAMAZ (regresyon — bir kere %45 şişirmişti)", () => {
    const css = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme } });
    const darkBlockStart = css.indexOf('[data-theme="dark"] {');
    const darkBlockEnd = css.indexOf("}", darkBlockStart);
    const darkBlock = css.slice(darkBlockStart, darkBlockEnd);
    expect(darkBlock).not.toContain("--mari-space-");
    expect(darkBlock).not.toContain("--mari-radius-");
    expect(darkBlock).toContain("--mari-color-primary-solid");
  });

  it("keyfi bir özel tema (resolveThemeConfig çıktısı) için de çalışır — sadece varsayılan temaya bağlı değil", () => {
    const resolved = resolveThemeConfig({ color: { primary: "#059669" } });
    const css = buildPlainThemeCss({ default: resolved.light, named: { dark: resolved.dark } });
    expect(css).toContain(resolved.light.color.primary.solid);
  });

  it("özel header verilirse kullanır, verilmezse varsayılan 'ÜRETİLMİŞ DOSYA' notunu ekler", () => {
    const withDefault = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme } });
    expect(withDefault).toContain("ÜRETİLMİŞ DOSYA");
    const withCustom = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme } }, { header: "/* özel başlık */" });
    expect(withCustom).toContain("/* özel başlık */");
    expect(withCustom).not.toContain("ÜRETİLMİŞ DOSYA");
  });

  describe("Faz 10 — N-adet isimli tema", () => {
    it("light/dark'ın ÖTESİNDE keyfi sayıda ek tema için ayrı [data-theme] bloğu üretir", () => {
      const brand = createNamedTheme("brand", "light", { color: { primary: "#a21caf" } });
      const highContrast = createNamedTheme("highContrast", "dark", { color: { primary: "#facc15" } });
      const css = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme, brand, highContrast } });

      expect(css).toContain('[data-theme="dark"] {');
      expect(css).toContain('[data-theme="brand"] {');
      expect(css).toContain('[data-theme="highContrast"] {');
      expect(css).toContain(brand.color.primary.solid);
      expect(css).toContain(highContrast.color.primary.solid);
      // Ek tema tabanının color-scheme'ini taşır; light/dark'ınki components CSS'inde.
      expect(css).toContain('[data-theme="highContrast"] {\n  color-scheme: dark;');
      expect(css).toContain('[data-theme="brand"] {\n  color-scheme: light;');
      expect(css).not.toContain('[data-theme="dark"] {\n  color-scheme');
    });

    it("'dark' adlı bir tema YOKSA @media (prefers-color-scheme: dark) fallback'i eklenmez (N-adet özel temaya genellenemeyen tarayıcı kavramı)", () => {
      const brand = createNamedTheme("brand", "light");
      const css = buildPlainThemeCss({ default: lightTheme, named: { brand } });
      expect(css).not.toContain("@media (prefers-color-scheme: dark)");
    });

    it("named olmadan varsayılan temayı kök ve açık seçim için üretir", () => {
      const css = buildPlainThemeCss({ default: lightTheme });
      expect(css).toContain(":root {");
      expect(css).toContain('[data-theme="light"]');
      expect(css).not.toContain('[data-theme="dark"]');
    });

    it("createNamedTheme: base='dark' iken kontrast araması dark yönünde çalışır (mode korunur, sadece name değişir)", () => {
      const highContrast = createNamedTheme("highContrast", "dark");
      expect(highContrast.mode).toBe("dark");
      expect(highContrast.name).toBe("highContrast");
      expect(highContrast.color.primary.text).toEqual(darkTheme.color.primary.text);
    });
  });
});

describe("buildTailwindThemeCss", () => {
  it("varsayılan olarak ./theme.css'i import eder, özel themeFilePath verilirse onu kullanır", () => {
    const defaultPath = buildTailwindThemeCss(lightTheme);
    expect(defaultPath).toContain('@import "./theme.css"');

    const customPath = buildTailwindThemeCss(lightTheme, { themeFilePath: "./mari-ui-theme.css" });
    expect(customPath).toContain('@import "./mari-ui-theme.css"');
  });

  it("@theme inline bloğunu üretir", () => {
    const css = buildTailwindThemeCss(lightTheme);
    expect(css).toContain("@theme inline {");
    expect(css).toContain("--color-mari-primary-solid: var(--mari-color-primary-solid);");
  });
});


describe("Tema sınırları", () => {
  it("sistem koyu tercihi açıkça seçilmiş özel temayı geçersiz kılmaz", () => {
    const css = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme } });
    expect(css).toContain(":root:not([data-theme])");
    expect(css).toContain('[data-theme="light"]');
  });
  it("özel başlık fontunu üretir; varsayılan fontlar kendi CSS değişkenlerine referans vermez", () => {
    const custom = createNamedTheme("brand", "light", { typography: { fontFamilyHeading: "Custom Heading" } });
    const css = buildPlainThemeCss({ default: lightTheme, named: { brand: custom } });
    expect(css).toContain("--mari-font-heading: Custom Heading;");
    expect(css).not.toContain("--mari-font-sans: var(--mari-font-sans");
    expect(buildTailwindThemeCss(lightTheme)).toContain("--font-heading: var(--mari-font-heading)");
  });
});

describe("buildTailwindMappingCss (Tailwind'li host)", () => {
  it("tailwindcss'i import ETMEZ; tema değişkenleri + @theme eşlemesi verir", () => {
    const css = buildTailwindMappingCss(lightTheme);
    expect(css).not.toContain('@import "tailwindcss"');
    expect(css).toContain('@import "./theme.css"');
    expect(css).toContain("--color-mari-primary-solid: var(--mari-color-primary-solid)");
  });
});
