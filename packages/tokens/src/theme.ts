import * as primitives from "./primitives";
import type { ColorRamp } from "./primitives/ramps";
import type { HexColor } from "./contrast";
import { buildSemanticColors, type ColorRole, type SemanticColorTokens } from "./semantic/colors";
import type { ThemeMode } from "./semantic/deriveColorRole";
import type { SpacingDensity } from "./runtimeTheme";

/** `sans`/`mono` burada bilinçli olarak `string` — Faz 6'nın tema stüdyosu tüketicinin kendi font ailesi string'ini geçirebilmeli, sabit iki literalle sınırlı kalamaz. */
export interface ThemeFontFamily {
  sans: string;
  mono: string;
  /** Başlık / marka ailesi; eski özel temalar için opsiyonel. */
  heading?: string;
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
  radius: primitives.RadiusTokens;
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
  radiusDensity?: primitives.RadiusDensity;
}

function buildTheme(mode: ThemeMode, options: BuildThemeOptions = {}): Theme {
  return {
    mode,
    name: options.name ?? mode,
    color: buildSemanticColors(mode, options.rampOverrides),
    spacing: primitives.spacing,
    radius: primitives.scaleRadius(options.radiusDensity),
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
 * karşılığı. `density.radius` (Faz 15) `Theme.radius` skalasını orantılı
 * ölçekler (`scaleRadius`) → web'de `--mari-radius-*` değişkenleri, dolayısıyla
 * `rounded-sm/md/lg/xl` utility'leri değişir. `radiusDensity` ayrıca olduğu
 * gibi geri döndürülür ki `@mari-ui/core/buildComponentSize` (native) da
 * aynı seçimi kullanabilsin.
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
    fontFamilyHeading?: string;
  };
  density?: {
    /** Faz 15 — tüm `--mari-radius-*` skalasını orantılı ölçekler (`none` = keskin). */
    radius?: primitives.RadiusDensity;
    /**
     * Faz 16.8.1 — uygulamanın varsayılan boşluk yoğunluğu (`--spacing` tabanı).
     * Son kullanıcı ThemeCustomizer ile `data-density` üzerinden yine değiştirebilir;
     * bu yalnız hiç seçim yapılmamışken geçerli olan değer.
     */
    spacing?: SpacingDensity;
  };
  themes?: Record<string, NamedThemeInput>;
}

/** CLI, stüdyo ve şema için tek varsayılan config kaynağı. */
export const defaultThemeConfig = {
  color: { primary: primitives.primaryRamp[600], accent: primitives.accentRamp[600] },
  typography: { fontFamilySans: primitives.fontFamily.sans, fontFamilyMono: primitives.fontFamily.mono, fontFamilyHeading: primitives.fontFamily.heading },
  density: { radius: "md", spacing: "normal" },
} satisfies Required<Omit<MariUiThemeConfig, "themes">>;

export interface NamedThemeInput {
  base: ThemeMode;
  color?: MariUiThemeConfig["color"];
  typography?: MariUiThemeConfig["typography"];
}

export interface ResolvedMariUiTheme {
  light: Theme;
  dark: Theme;
  radiusDensity: primitives.RadiusDensity;
  /** `density.spacing` (varsayılan `"normal"`) — `buildPlainThemeCss`e ve ThemeCustomizer `defaultValue`suna verilir. */
  spacingDensity: SpacingDensity;
  /** `config.themes`teki her girdinin ADI → çözümlenmiş `Theme`si. Girdi yoksa boş obje. */
  themes: Record<string, Theme>;
}

function resolveBuildThemeOptions(config: { color?: MariUiThemeConfig["color"]; typography?: MariUiThemeConfig["typography"] } = {}, name?: string): BuildThemeOptions {
  const rampOverrides: Partial<Record<ColorRole, ColorRamp>> = {};
  if (config.color?.primary && config.color.primary.toLowerCase() !== defaultThemeConfig.color.primary) rampOverrides.primary = primitives.generateRamp(config.color.primary);
  if (config.color?.accent && config.color.accent.toLowerCase() !== defaultThemeConfig.color.accent) rampOverrides.accent = primitives.generateRamp(config.color.accent);

  const fontFamilyOverride: Partial<ThemeFontFamily> = {};
  if (config.typography?.fontFamilySans) fontFamilyOverride.sans = config.typography.fontFamilySans;
  if (config.typography?.fontFamilyMono) fontFamilyOverride.mono = config.typography.fontFamilyMono;

  if (config.typography?.fontFamilyHeading) fontFamilyOverride.heading = config.typography.fontFamilyHeading;
  return { name, rampOverrides, fontFamily: fontFamilyOverride };
}

/**
 * Tek bir KEYFİ isimli tema üretir — `resolveThemeConfig`in `themes` alt
 * alanının kullandığı AYNI fonksiyon, ama tek bir tema için doğrudan
 * çağırmak isteyen bir tüketici (örn. `@mari-ui/native`de programatik bir
 * 3. tema kurmak isteyen biri) için de dışa açık.
 */
export function createNamedTheme(name: string, base: ThemeMode, config: Omit<NamedThemeInput, "base"> = {}, radiusDensity?: primitives.RadiusDensity): Theme {
  return buildTheme(base, { ...resolveBuildThemeOptions(config, name), radiusDensity });
}

/**
 * `mari-ui.config.json`ı (stüdyonun ürettiği anchor renkler + font ailesi +
 * radius yoğunluğu + Faz 10'un opsiyonel `themes`i) gerçek `Theme`
 * objelerine çözer. Faz 7'nin `npx mari-ui theme` komutu bu FONKSİYONUN
 * AYNISINI çağırır — burada tek kaynak olarak duruyor ki CLI mantığı
 * ikinci kez yazmasın.
 */
export function resolveThemeConfig(config: MariUiThemeConfig = {}): ResolvedMariUiTheme {
  const radiusDensity = config.density?.radius ?? "md";
  const baseOptions = { ...resolveBuildThemeOptions(config), radiusDensity };

  const namedThemes: Record<string, Theme> = {};
  for (const [name, themeInput] of Object.entries(config.themes ?? {})) {
    namedThemes[name] = createNamedTheme(name, themeInput.base, themeInput, radiusDensity);
  }

  return {
    light: buildTheme("light", { ...baseOptions, name: "light" }),
    dark: buildTheme("dark", { ...baseOptions, name: "dark" }),
    radiusDensity,
    spacingDensity: config.density?.spacing ?? "normal",
    themes: namedThemes,
  };
}
