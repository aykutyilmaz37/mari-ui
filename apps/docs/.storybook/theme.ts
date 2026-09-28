import { create } from "@storybook/theming";
import { darkTheme, lightTheme, type ThemeMode } from "@mari-ui/tokens";

export function createMariTheme(mode: ThemeMode) {
  const { color, fontFamily } = mode === "dark" ? darkTheme : lightTheme;
  return create({
    base: mode,
    brandTitle: "mari-ui",
    brandUrl: "/",
    brandTarget: "_self",
    fontBase: fontFamily.sans,
    fontCode: fontFamily.mono,
    colorPrimary: color.primary.text,
    colorSecondary: color.primary.text,
    appBg: color.canvas.surface,
    appContentBg: color.canvas.surface,
    appPreviewBg: color.canvas.surface,
    appBorderColor: color.canvas.border,
    appBorderRadius: 8,
    textColor: color.canvas.foreground,
    textInverseColor: color.primary.solidContrast,
    textMutedColor: color.canvas.muted,
    barTextColor: color.canvas.muted,
    barSelectedColor: color.primary.text,
    barHoverColor: color.primary.text,
    barBg: color.canvas.surface,
    inputBg: color.canvas.surface,
    inputBorder: color.canvas.input,
    inputTextColor: color.canvas.foreground,
    inputBorderRadius: 8,
  });
}

export const mariDocsThemes = { light: createMariTheme("light"), dark: createMariTheme("dark") };
