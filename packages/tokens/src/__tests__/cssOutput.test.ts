import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme, resolveThemeConfig, createNamedTheme } from "../theme";
import { buildPlainThemeCss, buildTailwindThemeCss } from "../cssOutput";

describe("buildPlainThemeCss", () => {
  it(":root ve [data-theme=dark] bloklarının hepsini içerir", () => {
    const css = buildPlainThemeCss({ default: lightTheme, named: { dark: darkTheme } });
    expect(css).toContain(":root {");
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  it("dark blok sadece --mari-color-* değişkenlerini taşır, spacing/radius'u TEKRARLAMAZ (regresyon — bir kere %45 şişirmişti)", () => {
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
    });

    it("'dark' adlı bir tema YOKSA @media (prefers-color-scheme: dark) fallback'i eklenmez (N-adet özel temaya genellenemeyen tarayıcı kavramı)", () => {
      const brand = createNamedTheme("brand", "light");
      const css = buildPlainThemeCss({ default: lightTheme, named: { brand } });
      expect(css).not.toContain("@media (prefers-color-scheme: dark)");
    });

    it("named olmadan (sadece default) da çalışır — sadece :root üretir", () => {
      const css = buildPlainThemeCss({ default: lightTheme });
      expect(css).toContain(":root {");
      expect(css).not.toContain("[data-theme=");
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
