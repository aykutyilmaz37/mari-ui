import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
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

  it("size, gövde yazı boyutunu etkiler ama layout'u etkilemez (web'deki fontSizeClass paritesi)", () => {
    const sm = cardRecipe(lightTheme, { size: "sm", bordered: true, inset: false });
    const lg = cardRecipe(lightTheme, { size: "lg", bordered: true, inset: false });
    expect(sm.bodyText.fontSize).toBeLessThan(lg.bodyText.fontSize as number);
    expect(sm.body.padding).toBe(lg.body.padding);
  });
});
