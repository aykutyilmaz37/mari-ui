import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { inputRecipe } from "../styles/recipes/inputRecipe";

const base = { color: "primary", variant: "outline", size: "md", shape: "default", disabled: false, focused: false } as const;

describe("inputRecipe", () => {
  it("outline: her kenarda borderWidth 1, focused'da 2'ye çıkar", () => {
    const unfocused = inputRecipe(lightTheme, base);
    const focused = inputRecipe(lightTheme, { ...base, focused: true });
    expect(unfocused.container.borderWidth).toBe(1);
    expect(focused.container.borderWidth).toBe(2);
  });

  it("underlined: sadece borderBottomWidth dolu, borderWidth 0 (yan kenarlıklar yok)", () => {
    const { container } = inputRecipe(lightTheme, { ...base, variant: "underlined" });
    expect(container.borderWidth).toBe(0);
    expect(container.borderBottomWidth).toBe(1);
    expect(container.borderRadius).toBe(0);
  });

  it("soft: arka plan dolu, kenarlık yok", () => {
    const { container } = inputRecipe(lightTheme, { ...base, variant: "soft" });
    expect(container.backgroundColor).toBe(lightTheme.color.primary.subtle);
    expect(container.borderWidth).toBe(0);
  });

  it("shape=pill: radius 9999 (underlined hariç — o her zaman 0)", () => {
    const { container } = inputRecipe(lightTheme, { ...base, shape: "pill" });
    expect(container.borderRadius).toBe(9999);
  });

  it("disabled: opacity 0.5", () => {
    const { container } = inputRecipe(lightTheme, { ...base, disabled: true });
    expect(container.opacity).toBe(0.5);
  });
});
