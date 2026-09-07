import * as primitives from "./primitives";
import { buildSemanticColors, type SemanticColorTokens } from "./semantic/colors";
import type { ThemeMode } from "./semantic/deriveColorRole";

export interface Theme {
  mode: ThemeMode;
  color: SemanticColorTokens;
  spacing: typeof primitives.spacing;
  radius: typeof primitives.radius;
  fontFamily: typeof primitives.fontFamily;
  fontSize: typeof primitives.fontSize;
  fontWeight: typeof primitives.fontWeight;
  lineHeight: typeof primitives.lineHeight;
  shadow: typeof primitives.shadow;
  zIndex: typeof primitives.zIndex;
  duration: typeof primitives.duration;
  easing: typeof primitives.easing;
  breakpoint: typeof primitives.breakpoint;
}

function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    color: buildSemanticColors(mode),
    spacing: primitives.spacing,
    radius: primitives.radius,
    fontFamily: primitives.fontFamily,
    fontSize: primitives.fontSize,
    fontWeight: primitives.fontWeight,
    lineHeight: primitives.lineHeight,
    shadow: primitives.shadow,
    zIndex: primitives.zIndex,
    duration: primitives.duration,
    easing: primitives.easing,
    breakpoint: primitives.breakpoint,
  };
}

/** Web `@theme`/CSS değişkenleri ve native `StyleSheet` için tek gerçek kaynak. */
export const lightTheme: Theme = buildTheme("light");
export const darkTheme: Theme = buildTheme("dark");

export const themes = { light: lightTheme, dark: darkTheme } as const;
