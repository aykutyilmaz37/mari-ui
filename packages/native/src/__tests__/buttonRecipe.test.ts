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

  it("variant=link: web ile aynı — alt çizgi yok", () => {
    const { label } = buttonRecipe(lightTheme, { ...base, variant: "link" });
    expect(label.textDecorationLine).toBe("none");
  });

  it("satır yüksekliği web'in Tailwind ölçeği: sm 12/16, md 14/20, lg 16/24", () => {
    expect(buttonRecipe(lightTheme, { ...base, size: "sm" }).label.lineHeight).toBe(16);
    expect(buttonRecipe(lightTheme, { ...base, size: "md" }).label.lineHeight).toBe(20);
    expect(buttonRecipe(lightTheme, { ...base, size: "lg" }).label.lineHeight).toBe(24);
  });

  it("basılma = web hover + active: outline/ghost rolün yumuşak zemini, hepsi %98", () => {
    const outline = buttonRecipe(lightTheme, { ...base, variant: "outline" }).pressedContainer;
    expect(outline.backgroundColor).toBe(lightTheme.color.primary.subtle);
    expect(outline.transform).toEqual([{ scale: 0.98 }]);
    const solid = buttonRecipe(lightTheme, { ...base, variant: "solid" }).pressedContainer;
    expect(solid.backgroundColor).toBe(lightTheme.color.primary.solidHover);
  });

  it("ikon boyutu web iconSizeClass ile aynı; dokunma alanı 44'e tamamlanır", () => {
    expect(buttonRecipe(lightTheme, { ...base, size: "xs" }).iconSize).toBe(12);
    expect(buttonRecipe(lightTheme, { ...base, size: "xl" }).iconSize).toBe(20);
    const md = buttonRecipe(lightTheme, { ...base, size: "md" }).hitSlop;
    expect(md).toEqual({ top: 6, bottom: 6, left: 0, right: 0 });
    const circle = buttonRecipe(lightTheme, { ...base, size: "sm", shape: "circle" }).hitSlop;
    expect(circle).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
    expect(buttonRecipe(lightTheme, { ...base, size: "xl" }).hitSlop.top).toBe(0);
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
