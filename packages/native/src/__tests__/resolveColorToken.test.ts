import { describe, expect, it } from "vitest";
import { lightTheme, darkTheme } from "@mari-ui/tokens";
import { resolveColorToken } from "../theme/resolveColorToken";

describe("resolveColorToken", () => {
  it("role+slot referansını theme.color üzerinden aynen okur", () => {
    expect(resolveColorToken(lightTheme, { role: "primary", slot: "solid" })).toBe(lightTheme.color.primary.solid);
    expect(resolveColorToken(darkTheme, { role: "error", slot: "text" })).toBe(darkTheme.color.error.text);
  });

  it("light/dark için farklı hex değerler döner (aynı referans, tema farklı)", () => {
    const light = resolveColorToken(lightTheme, { role: "primary", slot: "text" });
    const dark = resolveColorToken(darkTheme, { role: "primary", slot: "text" });
    expect(light).not.toBe(dark);
  });
});
