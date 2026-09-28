import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { buttonRecipe } from "../styles/recipes/buttonRecipe";

const base = { color: "primary", variant: "solid", size: "md", shape: "default", block: false, disabled: false } as const;

describe("buttonRecipe", () => {
  it("solid varyant: dolgu rengi solid, kenarlık yok", () => {
    const { container } = buttonRecipe(lightTheme, base);
    expect(container.backgroundColor).toBe(lightTheme.color.primary.solid);
    expect(container.borderWidth).toBe(0);
  });

  it("outline varyant: kenarlık genişliği 1, dolgu yok (regresyon: borderWidth variant adından değil, gerçek border token'ından türer)", () => {
    const { container } = buttonRecipe(lightTheme, { ...base, variant: "outline" });
    expect(container.borderWidth).toBe(1);
    expect(container.backgroundColor).toBeUndefined();
  });

  it("shape=circle: aspectRatio 1, yatay padding 0, tam yuvarlak radius", () => {
    const { container } = buttonRecipe(lightTheme, { ...base, shape: "circle" });
    expect(container.aspectRatio).toBe(1);
    expect(container.paddingHorizontal).toBe(0);
    expect(container.borderRadius).toBe(9999);
  });

  it("shape=square: radius 0 (boyutun kendi radius'unu ezer)", () => {
    const { container } = buttonRecipe(lightTheme, { ...base, shape: "square" });
    expect(container.borderRadius).toBe(0);
  });

  it("shape=default: boyutun kendi radius token'ı kullanılır (ezilmez)", () => {
    const { container } = buttonRecipe(lightTheme, base);
    expect(container.borderRadius).toBeGreaterThan(0);
    expect(container.borderRadius).not.toBe(9999);
  });

  it("disabled: opacity 0.5", () => {
    const { container } = buttonRecipe(lightTheme, { ...base, disabled: true });
    expect(container.opacity).toBe(0.5);
  });

  it("block: width %100", () => {
    const { container } = buttonRecipe(lightTheme, { ...base, block: true });
    expect(container.width).toBe("100%");
  });

  it("variant=link: metin altı çizili", () => {
    const { label } = buttonRecipe(lightTheme, { ...base, variant: "link" });
    expect(label.textDecorationLine).toBe("underline");
  });

  it("boyut arttıkça height ve fontSize artar (sm < md < lg)", () => {
    const sm = buttonRecipe(lightTheme, { ...base, size: "sm" });
    const md = buttonRecipe(lightTheme, { ...base, size: "md" });
    const lg = buttonRecipe(lightTheme, { ...base, size: "lg" });
    expect(sm.container.height).toBeLessThan(md.container.height as number);
    expect(md.container.height).toBeLessThan(lg.container.height as number);
    expect(sm.label.fontSize).toBeLessThanOrEqual(md.label.fontSize as number);
  });
});
