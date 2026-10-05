import { describe, expect, it } from "vitest";
import { nativeColor } from "../theme/nativeColor";
import { scrimColor, overlaySurface } from "../lib/overlay";
import { lightTheme, darkTheme } from "@mari-ui/tokens";

describe("native overlay renkleri", () => {
  it.each([
    ["rgb(25 24 34 / 0.45)", "rgba(25, 24, 34, 0.45)"],
    ["rgba(25 24 34 / 45%)", "rgba(25, 24, 34, 0.45)"],
    [" rgb( 25 24 34 ) ", "rgb(25, 24, 34)"],
    ["#aabbcc", "#aabbcc"],
    ["rgba(25, 24, 34, 0.45)", "rgba(25, 24, 34, 0.45)"],
    ["transparent", "transparent"],
  ])("%s → %s", (input, expected) => expect(nativeColor(input)).toBe(expected));

  it.each([lightTheme, darkTheme])("her temada geçerli karartma ve görünür yüzey", (theme) => {
    expect(scrimColor(theme)).toMatch(/^rgba\(\d+, \d+, \d+, [\d.]+\)$/);
    expect(overlaySurface(theme)).toMatchObject({ backgroundColor: theme.color.canvas.surface, borderColor: theme.color.canvas.border, borderWidth: 1 });
  });
});
