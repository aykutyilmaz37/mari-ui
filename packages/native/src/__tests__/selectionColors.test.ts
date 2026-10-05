import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme } from "@mari-ui/tokens";
import { checkboxColors, radioColors, switchTrackColor } from "../lib/selectionColors";

describe("checkboxColors", () => {
  it("renk verilmezse dinlenirken nötr input kenarı, seçilince primary dolgu", () => {
    expect(checkboxColors(lightTheme, "outline", undefined, false).border).toBe(lightTheme.color.canvas.input);
    const on = checkboxColors(lightTheme, "outline", undefined, true);
    expect(on.background).toBe(lightTheme.color.primary.solid);
    expect(on.mark).toBe(lightTheme.color.primary.solidContrast);
  });
  it("verilen renk dinlenirken de kenarı boyar (doğrulama durumu)", () => {
    expect(checkboxColors(lightTheme, "outline", "error", false).border).toBe(lightTheme.color.error.text);
  });
  it("solid dinlenirken tonlu zemin", () => {
    expect(checkboxColors(lightTheme, "solid", undefined, false).background).toBe(lightTheme.color.canvas.surfaceAlt);
  });
});

describe("radioColors", () => {
  it("outline seçilince rol kenarı + dolu nokta, solid seçilince dolgu + yüzey noktası", () => {
    const outline = radioColors(lightTheme, "outline", "success", true);
    expect(outline.border).toBe(lightTheme.color.success.text);
    expect(outline.mark).toBe(lightTheme.color.success.solid);
    const solid = radioColors(lightTheme, "solid", "success", true);
    expect(solid.background).toBe(lightTheme.color.success.solid);
    expect(solid.mark).toBe(lightTheme.color.canvas.surface);
  });
});

describe("switchTrackColor", () => {
  it("kapalı hal her renkte aynı nötr gri", () => {
    for (const theme of [lightTheme, darkTheme]) {
      expect(switchTrackColor(theme, "success", false, false)).toBe(theme.color.canvas.input);
      expect(switchTrackColor(theme, "error", false, false)).toBe(theme.color.canvas.input);
    }
  });
  it("açık hal rol dolgusu; iç metin varken kapalı hal okunur nötr dolgu", () => {
    expect(switchTrackColor(lightTheme, "success", true, false)).toBe(lightTheme.color.success.solid);
    expect(switchTrackColor(lightTheme, "success", false, true)).toBe(lightTheme.color.neutral.solid);
  });
});
