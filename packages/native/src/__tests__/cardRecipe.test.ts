import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme } from "@mari-ui/tokens";
import { cardRecipe } from "../styles/recipes/cardRecipe";

describe("cardRecipe", () => {
  it("bordered: kenarlık ve canvas.surface arka planı", () => {
    const { container } = cardRecipe(lightTheme, { bordered: true, inset: false });
    expect(container.borderWidth).toBe(1);
    expect(container.borderColor).toBe(lightTheme.color.canvas.border);
    expect(container.backgroundColor).toBe(lightTheme.color.canvas.surface);
  });

  it("bordered=false ve inset=false: kenarlık yok", () => {
    const { container } = cardRecipe(lightTheme, { bordered: false, inset: false });
    expect(container.borderWidth).toBeUndefined();
  });

  it("inset: surfaceAlt arka plan + kenarlık her zaman var (bordered=false olsa bile)", () => {
    const { container } = cardRecipe(lightTheme, { bordered: false, inset: true });
    expect(container.backgroundColor).toBe(lightTheme.color.canvas.surfaceAlt);
    expect(container.borderWidth).toBe(1);
  });

  it("native boyutlar: dolgu ve yazı büyür, web dolgu tablosu kullanılmaz", () => {
    const variants = (["sm", "md", "lg"] as const).map((size) => cardRecipe(lightTheme, { size, bordered: true, inset: false }));
    expect(variants.map((v) => v.body.padding)).toEqual([12, 16, 20]);
    expect(variants.map((v) => v.bodyText.fontSize)).toEqual([14, 16, 17]);
    expect(variants.map((v) => v.header.minHeight)).toEqual([44, 48, 56]);
    for (const v of variants) {
      expect(v.action.minHeight).toBeGreaterThanOrEqual(44);
      expect(v.body.flexGrow).toBe(1);
    }
  });

  it("koyu tema ve özel köşe token'ları her bölüme yansır", () => {
    const theme = { ...darkTheme, radius: { ...darkTheme.radius, xl: "0px" } };
    const styles = cardRecipe(theme, { bordered: true, inset: false });
    expect(styles.container.borderRadius).toBe(0);
    expect(styles.bodyText.color).toBe(darkTheme.color.canvas.foreground);
    expect(styles.extraText.color).toBe(darkTheme.color.canvas.muted);
    expect(styles.actions.borderColor).toBe(darkTheme.color.canvas.border);
    expect(styles.pressedContainer.backgroundColor).toBe(darkTheme.color.canvas.surfaceAlt);
  });
});
