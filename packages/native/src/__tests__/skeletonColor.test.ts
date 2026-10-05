import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme } from "@mari-ui/tokens";
import { skeletonColor, withAlpha } from "../theme/skeletonColor";

describe("skeletonColor", () => {
  it("withAlpha: hex → rgba; geçersiz değer olduğu gibi", () => {
    expect(withAlpha("#e2dfef", 0.7)).toBe("rgba(226, 223, 239, 0.7)");
    expect(withAlpha("rebeccapurple", 0.5)).toBe("rebeccapurple");
  });

  it("iskelet tonu web ile aynı: canvas.border %70, iki temada", () => {
    expect(skeletonColor(lightTheme)).toBe(withAlpha(lightTheme.color.canvas.border, 0.7));
    expect(skeletonColor(darkTheme)).toBe(withAlpha(darkTheme.color.canvas.border, 0.7));
  });
});
