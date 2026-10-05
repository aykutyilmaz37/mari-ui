import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { inputRecipe } from "../styles/recipes/inputRecipe";

const base = { color: undefined, variant: "outline", size: "md", shape: "default", disabled: false, focused: false } as const;

/**
 * Renk / kenarlık / odak davranışı web `Input` ölçümünden (2026-10-05): 1px
 * kenarlık canvas.input; odakta 1px primary (metin rengi) + 3px %20 hale.
 * Boyutlar native ölçekte (36/44/50; bkz. theme/nativeSize).
 */
describe("inputRecipe", () => {
  it("dinlenme: nötr gri kenarlık; odakta kalınlaşmaz, rol rengi + 3px hale", () => {
    const rest = inputRecipe(lightTheme, base).container;
    const focused = inputRecipe(lightTheme, { ...base, focused: true }).container;
    expect(rest.borderWidth).toBe(1);
    expect(rest.borderColor).toBe(lightTheme.color.canvas.input);
    expect(focused.borderWidth).toBe(1);
    expect(focused.borderColor).toBe(lightTheme.color.primary.text);
    expect((focused as { boxShadow?: string }).boxShadow).toBe("0px 0px 0px 3px rgba(105, 81, 206, 0.2)");
  });

  it("renk verilince dinlenmede de rol rengi (doğrulama durumu)", () => {
    expect(inputRecipe(lightTheme, { ...base, color: "error" }).container.borderColor).toBe(lightTheme.color.error.text);
  });

  it("köşe buton ile aynı ölçekte (sm 8 · md 12); pill tam yuvarlak + 4px fazla yan boşluk", () => {
    expect(inputRecipe(lightTheme, { ...base, size: "sm" }).container.borderRadius).toBe(8);
    expect(inputRecipe(lightTheme, base).container.borderRadius).toBe(12);
    const pill = inputRecipe(lightTheme, { ...base, shape: "pill" }).container;
    expect(pill.borderRadius).toBe(9999);
    expect(pill.paddingHorizontal).toBe(20);
  });

  it("underlined: yalnız alt çizgi, köşesiz, saydam, hale yok", () => {
    const { container } = inputRecipe(lightTheme, { ...base, variant: "underlined", focused: true });
    expect(container.borderWidth).toBe(0);
    expect(container.borderBottomWidth).toBe(1);
    expect(container.borderRadius).toBe(0);
    expect(container.backgroundColor).toBe("transparent");
    expect((container as { boxShadow?: string }).boxShadow).toBeUndefined();
  });

  it("ghost: kenarlıksız, saydam; odakta canvas.ring %40 hale", () => {
    const { container } = inputRecipe(lightTheme, { ...base, variant: "ghost", focused: true });
    expect(container.borderWidth).toBe(0);
    expect(container.backgroundColor).toBe("transparent");
    expect((container as { boxShadow?: string }).boxShadow).toContain("0.4)");
  });

  it("soft: surfaceAlt zemin + kenarlık; boyutlar 36/44/50, yazı 14/16/17", () => {
    expect(inputRecipe(lightTheme, { ...base, variant: "soft" }).container.backgroundColor).toBe(lightTheme.color.canvas.surfaceAlt);
    expect([inputRecipe(lightTheme, { ...base, size: "sm" }).container.height, inputRecipe(lightTheme, base).container.height, inputRecipe(lightTheme, { ...base, size: "lg" }).container.height]).toEqual([36, 44, 50]);
    expect(inputRecipe(lightTheme, base).input.fontSize).toBe(16);
  });

  it("disabled: opacity 0.5; yer tutucu soluk; CSS font listesi RN'e sızmaz", () => {
    const r = inputRecipe(lightTheme, { ...base, disabled: true });
    expect(r.container.opacity).toBe(0.5);
    expect(r.mutedColor).toBe(lightTheme.color.canvas.muted);
    expect(r.input.fontFamily).toBe("Geist");
  });
});
