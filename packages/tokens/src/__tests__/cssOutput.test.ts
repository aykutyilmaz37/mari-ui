import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme, resolveThemeConfig } from "../theme";
import { buildPlainThemeCss, buildTailwindThemeCss } from "../cssOutput";

describe("buildPlainThemeCss", () => {
  it(":root, [data-theme=dark] ve @media dark bloklarının hepsini içerir", () => {
    const css = buildPlainThemeCss(lightTheme, darkTheme);
    expect(css).toContain(":root {");
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  it("dark blok sadece --mari-color-* değişkenlerini taşır, spacing/radius'u TEKRARLAMAZ (regresyon — bir kere %45 şişirmişti)", () => {
    const css = buildPlainThemeCss(lightTheme, darkTheme);
    const darkBlockStart = css.indexOf('[data-theme="dark"] {');
    const darkBlockEnd = css.indexOf("}", darkBlockStart);
    const darkBlock = css.slice(darkBlockStart, darkBlockEnd);
    expect(darkBlock).not.toContain("--mari-space-");
    expect(darkBlock).not.toContain("--mari-radius-");
    expect(darkBlock).toContain("--mari-color-primary-solid");
  });

  it("keyfi bir özel tema (resolveThemeConfig çıktısı) için de çalışır — sadece varsayılan temaya bağlı değil", () => {
    const resolved = resolveThemeConfig({ color: { primary: "#059669" } });
    const css = buildPlainThemeCss(resolved.light, resolved.dark);
    expect(css).toContain(resolved.light.color.primary.solid);
  });

  it("özel header verilirse kullanır, verilmezse varsayılan 'ÜRETİLMİŞ DOSYA' notunu ekler", () => {
    const withDefault = buildPlainThemeCss(lightTheme, darkTheme);
    expect(withDefault).toContain("ÜRETİLMİŞ DOSYA");
    const withCustom = buildPlainThemeCss(lightTheme, darkTheme, { header: "/* özel başlık */" });
    expect(withCustom).toContain("/* özel başlık */");
    expect(withCustom).not.toContain("ÜRETİLMİŞ DOSYA");
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
