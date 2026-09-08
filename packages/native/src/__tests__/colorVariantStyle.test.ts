import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { resolveColorVariant } from "@mari-ui/core";
import { resolveColorVariantStyle } from "../theme/colorVariantStyle";

describe("resolveColorVariantStyle", () => {
  it("solid: container.backgroundColor + label.color + pressedContainer.backgroundColor dolu", () => {
    const style = resolveColorVariantStyle(lightTheme, resolveColorVariant("primary", "solid"));
    expect(style.container.backgroundColor).toBe(lightTheme.color.primary.solid);
    expect(style.container.borderColor).toBeUndefined();
    expect(style.label.color).toBe(lightTheme.color.primary.solidContrast);
    expect(style.pressedContainer.backgroundColor).toBe(lightTheme.color.primary.solidHover);
  });

  it("outline: sadece borderColor + label.color dolu, arka plan yok", () => {
    const style = resolveColorVariantStyle(lightTheme, resolveColorVariant("error", "outline"));
    expect(style.container.backgroundColor).toBeUndefined();
    expect(style.container.borderColor).toBe(lightTheme.color.error.border);
    expect(style.label.color).toBe(lightTheme.color.error.text);
    expect(style.pressedContainer.backgroundColor).toBeUndefined();
  });

  it("ghost: hiçbir container rengi yok, sadece metin rengi", () => {
    const style = resolveColorVariantStyle(lightTheme, resolveColorVariant("neutral", "ghost"));
    expect(style.container.backgroundColor).toBeUndefined();
    expect(style.container.borderColor).toBeUndefined();
    expect(style.label.color).toBe(lightTheme.color.neutral.text);
  });
});
