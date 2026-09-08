import * as primitives from "./primitives";
import type { ColorRamp } from "./primitives/ramps";
import type { HexColor } from "./contrast";
import { buildSemanticColors, type ColorRole, type SemanticColorTokens } from "./semantic/colors";
import type { ThemeMode } from "./semantic/deriveColorRole";

/** `sans`/`mono` burada bilinçli olarak `string` — Faz 6'nın tema stüdyosu tüketicinin kendi font ailesi string'ini geçirebilmeli, sabit iki literalle sınırlı kalamaz. */
export interface ThemeFontFamily {
  sans: string;
  mono: string;
}

export interface Theme {
  mode: ThemeMode;
  color: SemanticColorTokens;
  spacing: typeof primitives.spacing;
  radius: typeof primitives.radius;
  fontFamily: ThemeFontFamily;
  fontSize: typeof primitives.fontSize;
  fontWeight: typeof primitives.fontWeight;
  lineHeight: typeof primitives.lineHeight;
  shadow: typeof primitives.shadow;
  zIndex: typeof primitives.zIndex;
  duration: typeof primitives.duration;
  easing: typeof primitives.easing;
  breakpoint: typeof primitives.breakpoint;
}

interface BuildThemeOptions {
  rampOverrides?: Partial<Record<ColorRole, ColorRamp>>;
  fontFamily?: Partial<ThemeFontFamily>;
}

function buildTheme(mode: ThemeMode, options: BuildThemeOptions = {}): Theme {
  return {
    mode,
    color: buildSemanticColors(mode, options.rampOverrides),
    spacing: primitives.spacing,
    radius: primitives.radius,
    fontFamily: { ...primitives.fontFamily, ...options.fontFamily },
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

/**
 * Faz 6 — tema stüdyosu (`apps/studio`) çıktısı `mari-ui.config.json`,
 * `dist/schema.json`'daki `editable` sözleşmesinin BİREBİR TypeScript
 * karşılığı. `density.radius` burada YOK — o `Theme.radius`'u (sabit ölçek)
 * değil, `@mari-ui/core`'un `componentSize` tablosunu (bir component
 * BOYUTUNUN hangi radius seviyesini kullandığını) etkiler; bu yüzden
 * çözümlemesi `@mari-ui/core/buildComponentSize`'ın işi, `resolveThemeConfig`
 * sadece `radiusDensity`'yi olduğu gibi geri döndürür ki çağıran (stüdyo)
 * bunu `core`'a iletebilsin.
 */
export interface MariUiThemeConfig {
  color?: {
    primary?: HexColor;
    accent?: HexColor;
  };
  typography?: {
    fontFamilySans?: string;
    fontFamilyMono?: string;
  };
  density?: {
    radius?: keyof typeof primitives.radius;
  };
}

export interface ResolvedMariUiTheme {
  light: Theme;
  dark: Theme;
  radiusDensity: keyof typeof primitives.radius;
}

/**
 * `mari-ui.config.json`ı (stüdyonun ürettiği anchor renkler + font ailesi +
 * radius yoğunluğu) gerçek `Theme` objelerine çözer. Faz 7'nin `npx mari-ui
 * theme` komutu bu FONKSİYONUN AYNISINI çağıracak — burada tek kaynak olarak
 * şimdiden inşa ediliyor ki CLI geldiğinde mantığı ikinci kez yazmasın.
 */
export function resolveThemeConfig(config: MariUiThemeConfig = {}): ResolvedMariUiTheme {
  const rampOverrides: Partial<Record<ColorRole, ColorRamp>> = {};
  if (config.color?.primary) rampOverrides.primary = primitives.generateRamp(config.color.primary);
  if (config.color?.accent) rampOverrides.accent = primitives.generateRamp(config.color.accent);

  const fontFamilyOverride: { sans?: string; mono?: string } = {};
  if (config.typography?.fontFamilySans) fontFamilyOverride.sans = config.typography.fontFamilySans;
  if (config.typography?.fontFamilyMono) fontFamilyOverride.mono = config.typography.fontFamilyMono;

  const options: BuildThemeOptions = { rampOverrides, fontFamily: fontFamilyOverride };

  return {
    light: buildTheme("light", options),
    dark: buildTheme("dark", options),
    radiusDensity: config.density?.radius ?? "md",
  };
}
