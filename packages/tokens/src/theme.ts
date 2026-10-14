import * as primitives from "./primitives";
import type { ColorRamp } from "./primitives/ramps";
import type { HexColor } from "./contrast";
import { buildSemanticColors, type ColorRole, type SemanticColorTokens } from "./semantic/colors";
import type { ThemeMode } from "./semantic/deriveColorRole";
import type { SpacingDensity } from "./runtimeTheme";
import { applyPersona, type PersonaName } from "./personas";

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
  shadow: primitives.ShadowTokens;
  zIndex: typeof primitives.zIndex;
  duration: Record<keyof typeof primitives.duration, string>;
  easing: Record<keyof typeof primitives.easing, string>;
  breakpoint: typeof primitives.breakpoint;
  /** Faz 21 — gölge yoğunluğu ve hareket seviyesi; native bunlardan kendi gölge/süre değerlerini hesaplar. */
  effects: { shadow: primitives.ShadowDensity; motion: primitives.MotionLevel };
}

/** Renk/fontdan bağımsız, tüm temalara (light, dark, isimli) ortak eksenler. */
export type ThemeEffectOptions = Pick<BuildThemeOptions, "radiusDensity" | "shadowDensity" | "motion">;

interface BuildThemeOptions {
  name?: string;
  rampOverrides?: Partial<Record<ColorRole, ColorRamp>>;
  fontFamily?: Partial<ThemeFontFamily>;
  radiusDensity?: primitives.RadiusDensity;
  shadowDensity?: primitives.ShadowDensity;
  motion?: primitives.MotionLevel;
}

function buildTheme(mode: ThemeMode, options: BuildThemeOptions = {}): Theme {
  const shadowDensity = options.shadowDensity ?? "normal";
  const motion = options.motion ?? "normal";
  const { duration, easing } = primitives.scaleMotion(motion);
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
    shadow: primitives.scaleShadow(shadowDensity),
    zIndex: primitives.zIndex,
    duration,
    easing,
    breakpoint: primitives.breakpoint,
    effects: { shadow: shadowDensity, motion },
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
    /** Faz 21 — gölge yoğunluğu (`none` = gölgesiz, kartlar kenarlıkla ayrışır). */
    shadow?: primitives.ShadowDensity;
  };
  /** Faz 21 — hareket seviyesi: süre çarpanı + eğri (`off` = animasyonsuz). */
  motion?: primitives.MotionLevel;
  /**
   * Faz 21 — tasarım kişiliği. Kişiliğin renk/font/yoğunluk/gölge/hareket
   * ayarları TABAN olur; bu config'te açıkça yazılan her alan onu ezer.
   */
  persona?: PersonaName;
  /**
   * Faz 16.8.2 — büyük ekran ölçeği. `fluid: true` iken kök yazı boyutu 1920px'ten
   * itibaren ekran genişliğiyle büyür, 3840px'te (4K) `max` px'e ulaşıp durur.
   * Her şey rem tabanlı olduğu için tüm arayüz orantılı büyür. 1920px ve altı
   * etkilenmez. İşletim sistemi ölçeklemesi kapalı (%100) 4K ekranlar için.
   */
  scale?: {
    fluid?: boolean;
    /** 4K'de (3840px) ulaşılacak kök yazı boyutu, px. Varsayılan 22 (16–32 arası). */
    max?: number;
  };
  themes?: Record<string, NamedThemeInput>;
}

/** CLI, stüdyo ve şema için tek varsayılan config kaynağı. */
export const defaultThemeConfig = {
  color: { primary: primitives.primaryRamp[600], accent: primitives.accentRamp[600] },
  typography: { fontFamilySans: primitives.fontFamily.sans, fontFamilyMono: primitives.fontFamily.mono, fontFamilyHeading: primitives.fontFamily.heading },
  density: { radius: "md", spacing: "normal", shadow: "normal" },
  motion: "normal",
  scale: { fluid: false as boolean, max: 22 },
} satisfies Required<Omit<MariUiThemeConfig, "themes" | "persona">>;

export interface NamedThemeInput {
  base: ThemeMode;
  color?: Exclude<MariUiThemeConfig["color"], undefined>;
  typography?: Exclude<MariUiThemeConfig["typography"], undefined>;
}

export interface ResolvedMariUiTheme {
  light: Theme;
  dark: Theme;
  radiusDensity: primitives.RadiusDensity;
  /** `density.spacing` (varsayılan `"normal"`) — `buildPlainThemeCss`e ve ThemeCustomizer `defaultValue`suna verilir. */
  spacingDensity: SpacingDensity;
  /** `scale.fluid` açıksa 4K'deki kök yazı boyutu (px), kapalıysa `null` — `buildPlainThemeCss`e verilir. */
  fluidRootMax: number | null;
  /** `config.themes`teki her girdinin ADI → çözümlenmiş `Theme`si. Girdi yoksa boş obje. */
  themes: Record<string, Theme>;
}

function resolveBuildThemeOptions(config: { color?: Exclude<MariUiThemeConfig["color"], undefined>; typography?: Exclude<MariUiThemeConfig["typography"], undefined> } = {}, name?: string): BuildThemeOptions {
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
export function createNamedTheme(name: string, base: ThemeMode, config: Omit<NamedThemeInput, "base"> = {}, effects: ThemeEffectOptions = {}): Theme {
  return buildTheme(base, { ...resolveBuildThemeOptions(config, name), ...effects });
}

/**
 * `mari-ui.config.json`ı (stüdyonun ürettiği anchor renkler + font ailesi +
 * radius yoğunluğu + Faz 10'un opsiyonel `themes`i) gerçek `Theme`
 * objelerine çözer. Faz 7'nin `npx @mari-ui/cli theme` komutu bu FONKSİYONUN
 * AYNISINI çağırır — burada tek kaynak olarak duruyor ki CLI mantığı
 * ikinci kez yazmasın.
 */
export function resolveThemeConfig(input: MariUiThemeConfig = {}): ResolvedMariUiTheme {
  const config = applyPersona(input);
  const radiusDensity = config.density?.radius ?? "md";
  const effects: ThemeEffectOptions = { radiusDensity, shadowDensity: config.density?.shadow, motion: config.motion };
  const baseOptions = { ...resolveBuildThemeOptions(config), ...effects };

  // Ek tema rengi BAĞIMSIZ (her tema kendi paletini taşır, Faz 10), fontu ise
  // uygulama geneli: üst seviye (kişilik dahil) aileler miras alınır, temanın
  // kendi `typography`si ezer — yoksa `[data-theme="<ad>"]`e geçince kişilik
  // fontları varsayılana dönüyordu.
  const namedThemes: Record<string, Theme> = {};
  for (const [name, themeInput] of Object.entries(config.themes ?? {})) {
    const typography = { ...config.typography, ...themeInput.typography };
    namedThemes[name] = createNamedTheme(name, themeInput.base, { ...themeInput, typography }, effects);
  }

  return {
    light: buildTheme("light", { ...baseOptions, name: "light" }),
    dark: buildTheme("dark", { ...baseOptions, name: "dark" }),
    radiusDensity,
    spacingDensity: config.density?.spacing ?? "normal",
    fluidRootMax: config.scale?.fluid ? (config.scale.max ?? defaultThemeConfig.scale.max) : null,
    themes: namedThemes,
  };
}
