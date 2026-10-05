import type { Theme } from "./theme";
import { themeToCssVariables } from "./cssVariables";
import { spacingDensityBase, type SpacingDensity } from "./runtimeTheme";

/**
 * `scripts/build-css.ts` (paketin KENDİ varsayılan teması için, build
 * zamanında `dist/theme.css` üretir) VE `@mari-ui/cli`'ın `theme` komutu
 * (Faz 7 — bir TÜKETİCİNİN `mari-ui.config.json`'dan türettiği ÖZEL teması
 * için, tüketicinin kendi projesinde çalışma zamanında) AYNI bu iki
 * fonksiyonu çağırır. CSS bloğu inşa mantığı iki yerde ayrı ayrı elle
 * tutulmuyor — biri güncellenip diğeri unutulursa sessizce birbirinden
 * sapardı (nitekim `themeToCssVariables`e geçişte fiilen bir kere oldu, bkz.
 * `build-css.ts`teki `onlyColorVars` notu).
 */

function cssSafeKey(key: string): string {
  return key.replace(".", "_");
}

function varsToLines(vars: Record<string, string>): string[] {
  return Object.entries(vars).map(([name, value]) => `  ${name}: ${value};`);
}

/** Renk ve font aileleri tema sınırında yeniden bağlanır; boyut ölçeği kökte kalır. */
function scopedThemeVars(theme: Theme): Record<string, string> {
  return Object.fromEntries(Object.entries(themeToCssVariables(theme)).filter(([name]) =>
    name.startsWith("--mari-color-") || ["--mari-font-sans", "--mari-font-mono", "--mari-font-heading"].includes(name)
  ));
}

export interface CssOutputOptions {
  /** Dosyanın başına eklenecek yorum bloğu. Varsayılan: genel bir "üretilmiş dosya" notu. */
  header?: string;
  /**
   * Faz 16.8.1 — `mari-ui.config.json` `density.spacing`. `"normal"` dışındaysa
   * `:root:not([data-density])`e `--spacing` yazılır: son kullanıcının
   * `data-density` seçimi (ThemeCustomizer) her zaman öncelikli kalır.
   */
  spacingDensity?: SpacingDensity;
  /** Faz 16.8.2 — `mari-ui.config.json` `scale` açıksa 4K'deki kök yazı boyutu (px); bkz. `fluidRootFontSize`. */
  fluidRootMax?: number | null;
}

const DEFAULT_HEADER = ["/**", " * ÜRETİLMİŞ DOSYA — elle düzenlemeyin.", " * Kaynak: @mari-ui/tokens (theme.ts + cssOutput.ts)", " */", ""].join(
  "\n"
);

/**
 * Faz 10 (backlog madde 10 — 3. tema desteği): `default` `:root`e yazılır,
 * `named`teki HER giriş kendi `[data-theme="<anahtar>"]` bloğu olur —
 * `dark` da dahil, artık özel bir statü taşımıyor (tüketicinin `"brand"`/
 * `"highContrast"` gibi keyfi sayıda ek teması AYNI mekanizmaya takılabilir).
 */
export interface CssThemeSet {
  /** `:root`e (herhangi bir `data-theme` olmadan varsayılan) yazılacak tema — genelde `lightTheme`. */
  default: Theme;
  /** Anahtarı `[data-theme="<anahtar>"]` seçicisi olur. `"dark"` burada sıradan bir isim — özel davranışı SADECE `@media (prefers-color-scheme: dark)` fallback'i tetiklemesi (aşağıda). */
  named?: Record<string, Theme>;
}

const FLUID_START_PX = 1920;
const FLUID_END_PX = 3840;
const BASE_ROOT_PX = 16;

const round = (n: number) => Number(n.toFixed(4));

/**
 * Akışkan kök yazı boyutu: 1920px'e kadar tarayıcı varsayılanı (100%),
 * 3840px'te `maxPx`, arası doğrusal. Alt sınır `100%`/rem — kullanıcının
 * tarayıcı yazı boyutu tercihi korunur; medya sorgusu kırılımları (rem,
 * başlangıç değerine göre) etkilenmez. `maxPx` 16–32'ye sıkıştırılır.
 */
export function fluidRootFontSize(maxPx: number): string {
  const max = Math.min(Math.max(maxPx, BASE_ROOT_PX), BASE_ROOT_PX * 2);
  const slope = (max - BASE_ROOT_PX) / (FLUID_END_PX - FLUID_START_PX);
  const interceptRem = round((BASE_ROOT_PX - slope * FLUID_START_PX) / BASE_ROOT_PX);
  return `clamp(100%, ${round(slope * 100)}vw + ${interceptRem}rem, ${round(max / BASE_ROOT_PX)}rem)`;
}

/**
 * Varsayılan yoğunluk yalnız `<html>`de hiç `data-density` yokken geçerli.
 * Sıkı mod dokunmatikte normale döner (44px dokunma hedefi) —
 * `@mari-ui/components/styles.css`teki `[data-density="compact"]` kuralıyla aynı.
 */
function spacingDensityLines(density: SpacingDensity = "normal"): string[] {
  if (density === "normal") return [];
  const lines = [`:root:not([data-density]) {`, `  --spacing: ${spacingDensityBase[density]};`, "}", ""];
  if (density === "compact") {
    lines.push(
      "@media (pointer: coarse) {",
      "  :root:not([data-density]) {",
      `    --spacing: ${spacingDensityBase.normal};`,
      "  }",
      "}",
      ""
    );
  }
  return lines;
}

/**
 * SADECE `--mari-*` CSS değişkenleri. Hiçbir şeye bağımlı değildir —
 * Tailwind kurulu olmayan bir tüketicide de çalışır ("Tailwind zorunlu
 * değil" kararının somut karşılığı, bkz. proje planı).
 */
export function buildPlainThemeCss(themeSet: CssThemeSet, options: CssOutputOptions = {}): string {
  const header = options.header ?? DEFAULT_HEADER;
  const lines: string[] = [header, ":root {", ...varsToLines(themeToCssVariables(themeSet.default)), "}", ""];

  for (const [name, theme] of Object.entries({ [themeSet.default.name]: themeSet.default, ...themeSet.named })) {
    lines.push(`[data-theme="${name}"] {`, ...varsToLines(scopedThemeVars(theme)), "}", "");
  }

  // `prefers-color-scheme` tarayıcının kendi İKİ değerli (light/dark)
  // kavramı — N-adet özel temaya genellenemez. Sadece `named.dark` VARSA
  // sistem tercihi fallback'i eklenir; başka özel temalar (`brand`, ...)
  // sadece açıkça `data-theme` ile seçildiklerinde devreye girer.
  lines.push(...spacingDensityLines(options.spacingDensity));
  if (options.fluidRootMax) lines.push(`html {`, `  font-size: ${fluidRootFontSize(options.fluidRootMax)};`, "}", "");

  const darkTheme = themeSet.named?.dark;
  if (darkTheme) {
    lines.push(
      "@media (prefers-color-scheme: dark) {",
      '  :root:not([data-theme]) {',
      ...varsToLines(scopedThemeVars(darkTheme)).map((l) => `  ${l}`),
      "  }",
      "}",
      ""
    );
  }

  return lines.join("\n");
}

const THEME_TOKEN_KEYS = [
  ...["primary", "accent", "success", "error", "warning", "info", "neutral"].flatMap((role) => [
    `${role}`,
    `${role}-solid`,
    `${role}-solid-contrast`,
    `${role}-solid-hover`,
    `${role}-subtle`,
    `${role}-subtle-contrast`,
    `${role}-border`,
  ]),
  "surface",
  "surface-alt",
  "border",
  "input",
  "ring",
  "scrim",
  "foreground",
  "muted",
  "disabled",
  "rating",
  "rating-stroke",
  ...Array.from({ length: 8 }, (_, i) => `chart-${i + 1}`),
];

function buildThemeInlineBlock(theme: Theme): string {
  const colorLines = THEME_TOKEN_KEYS.map((key) => `  --color-mari-${key}: var(--mari-color-${key});`);
  const spacingLines = Object.keys(theme.spacing).map((key) => `  --spacing-mari-${cssSafeKey(key)}: var(--mari-space-${cssSafeKey(key)});`);
  const radiusLines = Object.keys(theme.radius).map((key) => `  --radius-mari-${key}: var(--mari-radius-${key});`);
  // z-index skalası da namespace'lenir: `z-mari-modal` gibi utility'ler
  // üretilsin diye. Bugün `z-50`, `z-40`, `z-[999]`, `z-[9999]` rastgele
  // dağılmıştı (Modal/Drawer/Toast/Tooltip/Dropdown hepsi kendi katmanını
  // seçiyordu) — artık hepsi bu tek skaladan okur.
  // Tailwind v4'ün `z-*` utility'si `--z-index-*` namespace'ini okur; `--z-mari-*`
  // hiçbir utility üretmiyordu (tüm katmanlar `z-index: auto` kalıyordu).
  const zIndexLines = Object.keys(theme.zIndex).map((key) => `  --z-index-mari-${key}: var(--mari-z-${key});`);
  // Elevation skalası namespace'lenir: `shadow-mari-md` gibi utility'ler için.
  // Bugün component'ler `shadow-lg`/`shadow-2xl` gibi Tailwind built-in'lerini
  // rastgele kullanıyordu (Faz 13 audit) — hepsi bu tek skaladan okuyacak.
  const shadowLines = Object.keys(theme.shadow).map((key) => `  --shadow-mari-${key}: var(--mari-shadow-${key});`);
  return ["@theme inline {", ...colorLines, ...spacingLines, ...radiusLines, ...zIndexLines, ...shadowLines,
    "  --font-sans: var(--mari-font-sans);",
    "  --font-mono: var(--mari-font-mono);",
    "  --font-heading: var(--mari-font-heading);",
    "  --default-font-family: var(--mari-font-sans);",
    "  --default-mono-font-family: var(--mari-font-mono);",
    ...["sm", "md", "lg", "xl"].map((key) => `  --radius-${key}: var(--mari-radius-${key});`),
    "}"].join("\n");
}

/**
 * `theme.css`i import eder + `@theme inline` katmanı ekler (`bg-mari-
 * primary` gibi utility'ler için). Sadece Tailwind v4 kullanan tüketiciler
 * bunu tercih eder. `themeFilePath` varsayılan olarak paketin kendi
 * `./theme.css`sini işaret eder — `@mari-ui/cli`ın `theme` komutu tüketici
 * projesinde farklı bir göreli yol yazmak isteyebilir.
 */
export function buildTailwindThemeCss(light: Theme, options: CssOutputOptions & { themeFilePath?: string } = {}): string {
  const header = options.header ?? DEFAULT_HEADER;
  const themeFilePath = options.themeFilePath ?? "./theme.css";
  return [
    header,
    "/* Sadece Tailwind v4 kullanan tüketiciler için opsiyonel eşleme katmanı. */",
    '@import "tailwindcss";',
    `@import "${themeFilePath}";`,
    "",
    buildThemeInlineBlock(light),
    "",
  ].join("\n");
}
