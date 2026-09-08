import type { Theme } from "./theme";
import { themeToCssVariables } from "./cssVariables";

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

/**
 * `[data-theme="dark"]` bloğu sadece MODA GÖRE DEĞİŞEN (`--mari-color-*`)
 * değişkenleri taşımalı — spacing/radius/fontSize/shadow/zIndex/duration/
 * easing/fontFamily light ve dark'ta ZATEN aynı, `:root`te bir kez yeterli.
 * `themeToCssVariables` ikisini birden döndürdüğü için burada filtreleniyor;
 * filtrelenmezse her mod bloğunda gereksiz yere tekrarlanıp çıktı boyutu
 * ciddi şişer (fiilen ~%45, bkz. git geçmişi).
 */
function onlyColorVars(vars: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(vars).filter(([name]) => name.startsWith("--mari-color-")));
}

export interface CssOutputOptions {
  /** Dosyanın başına eklenecek yorum bloğu. Varsayılan: genel bir "üretilmiş dosya" notu. */
  header?: string;
}

const DEFAULT_HEADER = ["/**", " * ÜRETİLMİŞ DOSYA — elle düzenlemeyin.", " * Kaynak: @mari-ui/tokens (theme.ts + cssOutput.ts)", " */", ""].join(
  "\n"
);

/**
 * SADECE `--mari-*` CSS değişkenleri. Hiçbir şeye bağımlı değildir —
 * Tailwind kurulu olmayan bir tüketicide de çalışır ("Tailwind zorunlu
 * değil" kararının somut karşılığı, bkz. proje planı).
 */
export function buildPlainThemeCss(light: Theme, dark: Theme, options: CssOutputOptions = {}): string {
  const header = options.header ?? DEFAULT_HEADER;
  return [
    header,
    ":root {",
    ...varsToLines(themeToCssVariables(light)),
    "}",
    "",
    '[data-theme="dark"] {',
    ...varsToLines(onlyColorVars(themeToCssVariables(dark))),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    '  :root:not([data-theme="light"]) {',
    ...varsToLines(onlyColorVars(themeToCssVariables(dark))).map((l) => `  ${l}`),
    "  }",
    "}",
    "",
  ].join("\n");
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
  "foreground",
  "muted",
  "disabled",
];

function buildThemeInlineBlock(theme: Theme): string {
  const colorLines = THEME_TOKEN_KEYS.map((key) => `  --color-mari-${key}: var(--mari-color-${key});`);
  const spacingLines = Object.keys(theme.spacing).map((key) => `  --spacing-mari-${cssSafeKey(key)}: var(--mari-space-${cssSafeKey(key)});`);
  const radiusLines = Object.keys(theme.radius).map((key) => `  --radius-mari-${key}: var(--mari-radius-${key});`);
  // z-index skalası da namespace'lenir: `z-mari-modal` gibi utility'ler
  // üretilsin diye. Bugün `z-50`, `z-40`, `z-[999]`, `z-[9999]` rastgele
  // dağılmıştı (Modal/Drawer/Toast/Tooltip/Dropdown hepsi kendi katmanını
  // seçiyordu) — artık hepsi bu tek skaladan okur.
  const zIndexLines = Object.keys(theme.zIndex).map((key) => `  --z-mari-${key}: var(--mari-z-${key});`);
  return ["@theme inline {", ...colorLines, ...spacingLines, ...radiusLines, ...zIndexLines, "}"].join("\n");
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
