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
  /**
   * WCAG kontrast aramasının hangi YÖNDE çalıştığı (`deriveColorRole`'ün
   * "surface açık mı koyu mu" varsayımı) — Faz 10'dan önce bu aynı zamanda
   * temanın "kimliği" gibi kullanılıyordu. Artık İKİ ayrı kavram: `mode`
   * SADECE kontrast yönünü belirler, `name` (aşağıda) temanın GÖRÜNEN
   * kimliğidir. Bir tüketicinin özel "brand" veya "highContrast" teması
   * `mode: "light"` (ya da `"dark"`) TABANLI olabilir ama `name: "brand"`
   * taşır — `deriveColorRole` hâlâ doğru yönde arama yapar, CSS çıktısı
   * `[data-theme="brand"]` altında yayınlanır.
   */
  mode: ThemeMode;
  /**
   * `data-theme="..."` seçicisinde kullanılacak isim (Faz 10 — backlog
   * madde 10: "tüketici 3. temayı ekleyebilmeli"). Yerleşik `lightTheme`/
   * `darkTheme` için sırasıyla `"light"`/`"dark"`; `createNamedTheme()`ın
   * ürettiği özel temalarda tüketicinin verdiği KEYFİ isim.
   */
  name: string;
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
  name?: string;
  rampOverrides?: Partial<Record<ColorRole, ColorRamp>>;
  fontFamily?: Partial<ThemeFontFamily>;
}

function buildTheme(mode: ThemeMode, options: BuildThemeOptions = {}): Theme {
  return {
    mode,
    name: options.name ?? mode,
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
 *
 * `themes` (Faz 10 — backlog madde 10): light/dark'IN ÖTESİNDE, tüketicinin
 * kendi projesine ekleyebileceği KEYFİ sayıda ek isimli tema. Her girdi
 * kendi `base`ini (kontrast aramasının hangi yönde çalışacağını) ve
 * isteğe bağlı kendi renk/tipografi override'larını taşır — `color`/
 * `typography` alanlarıyla AYNI şekil, sadece bir isim ALTINDA. Örnek:
 * `{ "brand": { base: "light", color: { primary: "#a21caf" } } }` ->
 * `mari-ui-theme.css`de `[data-theme="brand"] { ... }` olarak çıkar.
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
  themes?: Record<string, NamedThemeInput>;
}

/** `MariUiThemeConfig`in `color`/`typography` alanlarıyla AYNI şekil — sadece bir `base` (kontrast yönü) eklenmiş hali. */
export interface NamedThemeInput {
  base: ThemeMode;
  color?: MariUiThemeConfig["color"];
  typography?: MariUiThemeConfig["typography"];
}

export interface ResolvedMariUiTheme {
  light: Theme;
  dark: Theme;
  radiusDensity: keyof typeof primitives.radius;
  /** `config.themes`teki her girdinin ADI → çözümlenmiş `Theme`si. Girdi yoksa boş obje. */
  themes: Record<string, Theme>;
}

function resolveBuildThemeOptions(config: { color?: MariUiThemeConfig["color"]; typography?: MariUiThemeConfig["typography"] } = {}, name?: string): BuildThemeOptions {
  const rampOverrides: Partial<Record<ColorRole, ColorRamp>> = {};
  if (config.color?.primary) rampOverrides.primary = primitives.generateRamp(config.color.primary);
  if (config.color?.accent) rampOverrides.accent = primitives.generateRamp(config.color.accent);

  const fontFamilyOverride: { sans?: string; mono?: string } = {};
  if (config.typography?.fontFamilySans) fontFamilyOverride.sans = config.typography.fontFamilySans;
  if (config.typography?.fontFamilyMono) fontFamilyOverride.mono = config.typography.fontFamilyMono;

  return { name, rampOverrides, fontFamily: fontFamilyOverride };
}

/**
 * Tek bir KEYFİ isimli tema üretir — `resolveThemeConfig`in `themes` alt
 * alanının kullandığı AYNI fonksiyon, ama tek bir tema için doğrudan
 * çağırmak isteyen bir tüketici (örn. `@mari-ui/native`de programatik bir
 * 3. tema kurmak isteyen biri) için de dışa açık.
 */
export function createNamedTheme(name: string, base: ThemeMode, config: Omit<NamedThemeInput, "base"> = {}): Theme {
  return buildTheme(base, resolveBuildThemeOptions(config, name));
}

/**
 * `mari-ui.config.json`ı (stüdyonun ürettiği anchor renkler + font ailesi +
 * radius yoğunluğu + Faz 10'un opsiyonel `themes`i) gerçek `Theme`
 * objelerine çözer. Faz 7'nin `npx mari-ui theme` komutu bu FONKSİYONUN
 * AYNISINI çağırır — burada tek kaynak olarak duruyor ki CLI mantığı
 * ikinci kez yazmasın.
 */
export function resolveThemeConfig(config: MariUiThemeConfig = {}): ResolvedMariUiTheme {
  const baseOptions = resolveBuildThemeOptions(config);

  const namedThemes: Record<string, Theme> = {};
  for (const [name, themeInput] of Object.entries(config.themes ?? {})) {
    namedThemes[name] = createNamedTheme(name, themeInput.base, themeInput);
  }

  return {
    light: buildTheme("light", { ...baseOptions, name: "light" }),
    dark: buildTheme("dark", { ...baseOptions, name: "dark" }),
    radiusDensity: config.density?.radius ?? "md",
    themes: namedThemes,
  };
}
