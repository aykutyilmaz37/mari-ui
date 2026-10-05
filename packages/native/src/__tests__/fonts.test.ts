import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { withFonts } from "../theme/fonts";
import { nativeFontFamily } from "../theme/fontFamily";

describe("withFonts", () => {
  it("system (varsayılan): aile adı verilmez → platform fontu; tema kimliği sabit", () => {
    const system = withFonts(lightTheme, "system");
    expect(nativeFontFamily(system.fontFamily.sans)).toBeUndefined();
    expect(nativeFontFamily(system.fontFamily.heading ?? "")).toBeUndefined();
    expect(nativeFontFamily(system.fontFamily.mono)).toBeUndefined();
    expect(withFonts(lightTheme, "system")).toBe(system);
    expect(system.color).toBe(lightTheme.color);
  });

  it("brand: token aileleri (Geist / Manrope / Geist Mono)", () => {
    const brand = withFonts(lightTheme, "brand");
    expect(brand).toBe(lightTheme);
    expect(nativeFontFamily(brand.fontFamily.sans)).toBe("Geist");
    expect(nativeFontFamily(brand.fontFamily.heading ?? "")).toBe("Manrope");
    expect(nativeFontFamily(brand.fontFamily.mono)).toBe("Geist Mono");
  });
});
