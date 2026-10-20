import type { Theme } from "./theme";
import { themeToCssVariables } from "./cssVariables";
import { colorTokenNames } from "./colorTokens";
import { spacingDensityBase, type SpacingDensity } from "./runtimeTheme";

/**
 * `scripts/build-css.ts` (paketin KENDİ varsayılan teması için, build
 * zamanında `dist/theme.css` üretir) VE `@mari-ui/cli`'ın `theme` komutu AYNI bu iki
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
   * `mari-ui.config.json` `density.spacing`. `"normal"` dışındaysa
   * `:root:not([data-density])`e `--spacing` yazılır: son kullanıcının
   * `data-density` seçimi (ThemeCustomizer) her zaman öncelikli kalır.
   */
  spacingDensity?: SpacingDensity;
  /** `mari-ui.config.json` `scale` açıksa 4K'deki kök yazı boyutu (px); bkz. `fluidRootFontSize`. */
  fluidRootMax?: number | null;
}

const DEFAULT_HEADER = /* @__PURE__ */ ["/**", " * ÜRETİLMİŞ DOSYA — elle düzenlemeyin.", " * Kaynak: @mari-ui/tokens (theme.ts + cssOutput.ts)", " */", ""].join(
  "\n"
);

/*
 * Faz 10 (backlog madde 10 — 3. tema desteği): `default` `:root`e yazılır,
 * `named`teki HER giriş kendi `[data-theme="<anahtar>"]` bloğu olur —
 * `dark` da dahil, artık özel bir statü taşımıyor (tüketicinin `"brand"`/
 * `"highContrast"` gibi keyfi sayıda ek teması AYNI mekanizmaya takılabilir).
 */
/**
 * `buildPlainThemeCss`e verilen temalar: `default` `:root`a, `named` içindekiler kendi
 * `[data-theme="<ad>"]` bloklarına yazılır.
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
 * Tailwind kurulu olmayan bir tüketicide de çalışır.
 */
export function buildPlainThemeCss(themeSet: CssThemeSet, options: CssOutputOptions = {}): string {
  const header = options.header ?? DEFAULT_HEADER;
  const lines: string[] = [header, ":root {", ...varsToLines(themeToCssVariables(themeSet.default)), "}", ""];

  for (const [name, theme] of Object.entries({ [themeSet.default.name]: themeSet.default, ...themeSet.named })) {
    // light/dark'ın `color-scheme`i components CSS'inde; ek temalar tabanlarınınkini burada alır
    // (koyu tabanlı temada kaydırma çubuğu ve yerel form kontrolleri de koyu olsun).
    const scheme = name === "light" || name === "dark" ? [] : [`  color-scheme: ${theme.mode};`];
    lines.push(`[data-theme="${name}"] {`, ...scheme, ...varsToLines(scopedThemeVars(theme)), "}", "");
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

const THEME_TOKEN_KEYS = colorTokenNames;

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
    // Faz 21 — süresiz `transition` sınıfları da hareket seviyesine uyar.
    "  --default-transition-duration: calc(150ms * var(--mari-motion-scale, 1));",
    "  --default-transition-timing-function: var(--mari-easing-standard);",
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
/**
 * Tailwind'li HOST için eşleme: `@import "tailwindcss"` İÇERMEZ (host zaten yapar;
 * iki kez import, preflight ve utility'leri ikiler). Host'un tek Tailwind derlemesi
 * `bg-mari-*`, `shadow-mari-*`, `rounded-*` … sınıflarını bu değişkenlere bağlar.
 * `@mari-ui/components/tailwind.css` bunu import eder.
 */
export function buildTailwindMappingCss(light: Theme, options: CssOutputOptions & { themeFilePath?: string } = {}): string {
  const header = options.header ?? DEFAULT_HEADER;
  const themeFilePath = options.themeFilePath ?? "./theme.css";
  return [header, `@import "${themeFilePath}";`, "", buildThemeInlineBlock(light), ""].join("\n");
}

export function buildTailwindThemeCss(light: Theme, options: CssOutputOptions & { themeFilePath?: string } = {}): string {
  const header = options.header ?? DEFAULT_HEADER;
  const themeFilePath = options.themeFilePath ?? "./theme.css";
  return [
    header,
    "/* Tailwind'i KENDİSİ import eden tam giriş — Tailwind'li bir projede `tailwindcss`i ikinci kez yükler; host'lar `tailwind.css` (eşleme) ya da `@mari-ui/components/tailwind.css` kullanmalı. */",
    '@import "tailwindcss";',
    `@import "${themeFilePath}";`,
    "",
    buildThemeInlineBlock(light),
    "",
  ].join("\n");
}
