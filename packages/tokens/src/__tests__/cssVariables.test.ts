import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme } from "../theme";
import { themeToCssVariables } from "../cssVariables";

describe("themeToCssVariables", () => {
  it("her semantik rol için 7 renk değişkeni üretir (text/solid/solidContrast/solidHover/subtle/subtleContrast/border)", () => {
    const vars = themeToCssVariables(lightTheme);
    expect(vars["--mari-color-primary"]).toBe(lightTheme.color.primary.text);
    expect(vars["--mari-color-primary-solid"]).toBe(lightTheme.color.primary.solid);
    expect(vars["--mari-color-primary-solid-contrast"]).toBe(lightTheme.color.primary.solidContrast);
    expect(vars["--mari-color-primary-solid-hover"]).toBe(lightTheme.color.primary.solidHover);
    expect(vars["--mari-color-primary-subtle"]).toBe(lightTheme.color.primary.subtle);
    expect(vars["--mari-color-primary-subtle-contrast"]).toBe(lightTheme.color.primary.subtleContrast);
    expect(vars["--mari-color-primary-border"]).toBe(lightTheme.color.primary.border);
  });

  it("canvas token'larını da düzleştirir", () => {
    const vars = themeToCssVariables(lightTheme);
    expect(vars["--mari-color-surface"]).toBe(lightTheme.color.canvas.surface);
    expect(vars["--mari-color-foreground"]).toBe(lightTheme.color.canvas.foreground);
  });

  it("kesirli spacing anahtarındaki noktayı alt çizgiye çevirir (--mari-space-0_5)", () => {
    const vars = themeToCssVariables(lightTheme);
    expect(vars["--mari-space-0_5"]).toBe(lightTheme.spacing[0.5]);
    expect(vars["--mari-space-0.5"]).toBeUndefined();
  });

  it("font ailesini taşır", () => {
    const vars = themeToCssVariables(lightTheme);
    expect(vars["--mari-font-sans"]).toBe(lightTheme.fontFamily.sans);
    expect(vars["--mari-font-mono"]).toBe(lightTheme.fontFamily.mono);
  });

  it("light ve dark için farklı değerler üretir (not: solid tema-bağımsızdır — bkz. deriveColorRole.ts, bu yüzden 'text' karşılaştırılıyor)", () => {
    const lightVars = themeToCssVariables(lightTheme);
    const darkVars = themeToCssVariables(darkTheme);
    expect(lightVars["--mari-color-primary"]).not.toBe(darkVars["--mari-color-primary"]);
  });
});
