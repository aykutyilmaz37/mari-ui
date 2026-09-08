/**
 * `theme.ts`'teki tek kaynaktan CSS çıktıları üretir. Elle yazılmaz —
 * çünkü elle yazılan bir CSS token dosyası, mevcut `globals.css`'te olduğu
 * gibi (`--text-base: "#000000"` tırnaklı string hatası, `.dark` bloğunda
 * `:root` ile birebir aynı 16 satır) kaynaktan kopar ve sessizce bozulur.
 *
 * İki ayrı dosya üretilir, kasıtlı olarak:
 *
 *  - `dist/theme.css`          → SADECE `--mari-*` CSS değişkenleri. Hiçbir
 *    şeye bağımlı değildir, Tailwind kurulu olmayan tüketicide de çalışır.
 *    "Tailwind zorunlu değil" kararının somut karşılığı budur.
 *
 *  - `dist/tailwind-theme.css` → `theme.css`'i import eder + `@theme inline`
 *    katmanı ekler (`bg-mari-primary` gibi utility'ler için). Sadece
 *    Tailwind v4 kullanan tüketiciler bunu tercih eder.
 *
 * Değişken adı → değer eşlemesi (`--mari-color-primary-solid: #2563eb;` gibi)
 * `../src/cssVariables.ts`teki `themeToCssVariables()`ten gelir — bu FONKSİYON
 * aynı zamanda Faz 6'nın tema stüdyosu tarafından ÇALIŞMA ZAMANINDA (canlı
 * önizleme için) da çağrılıyor. Mapping burada ikinci kez elle yazılmıyor.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { darkTheme, lightTheme } from "../src/theme";
import { themeToCssVariables } from "../src/cssVariables";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, "../dist");

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
 * filtrelenmezse (fiilen bu refactor sırasında bir kere olduğu gibi) her
 * mod bloğunda gereksiz yere tekrarlanıp `theme.css`nin boyutu ~%45 şişer.
 */
function onlyColorVars(vars: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(vars).filter(([name]) => name.startsWith("--mari-color-")));
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

function buildThemeInlineBlock(): string {
  const colorLines = THEME_TOKEN_KEYS.map((key) => `  --color-mari-${key}: var(--mari-color-${key});`);
  const spacingLines = Object.keys(lightTheme.spacing).map(
    (key) => `  --spacing-mari-${cssSafeKey(key)}: var(--mari-space-${cssSafeKey(key)});`
  );
  const radiusLines = Object.keys(lightTheme.radius).map(
    (key) => `  --radius-mari-${key}: var(--mari-radius-${key});`
  );
  // z-index skalası da namespace'lenir: `z-mari-modal` gibi utility'ler
  // üretilsin diye. Bugün `z-50`, `z-40`, `z-[999]`, `z-[9999]` rastgele
  // dağılmıştı (Modal/Drawer/Toast/Tooltip/Dropdown hepsi kendi katmanını
  // seçiyordu) — artık hepsi bu tek skaladan okur.
  const zIndexLines = Object.keys(lightTheme.zIndex).map((key) => `  --z-mari-${key}: var(--mari-z-${key});`);
  return ["@theme inline {", ...colorLines, ...spacingLines, ...radiusLines, ...zIndexLines, "}"].join("\n");
}

const GENERATED_HEADER = [
  "/**",
  " * ÜRETİLMİŞ DOSYA — elle düzenlemeyin.",
  " * Kaynak: packages/tokens/src/theme.ts (+ scripts/build-css.ts)",
  " */",
  "",
].join("\n");

async function main() {
  const plainCss = [
    GENERATED_HEADER,
    ":root {",
    ...varsToLines(themeToCssVariables(lightTheme)),
    "}",
    "",
    '[data-theme="dark"] {',
    ...varsToLines(onlyColorVars(themeToCssVariables(darkTheme))),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    '  :root:not([data-theme="light"]) {',
    ...varsToLines(onlyColorVars(themeToCssVariables(darkTheme))).map((l) => `  ${l}`),
    "  }",
    "}",
    "",
  ].join("\n");

  const tailwindCss = [
    GENERATED_HEADER,
    '/* Sadece Tailwind v4 kullanan tüketiciler için opsiyonel eşleme katmanı. */',
    '@import "tailwindcss";',
    '@import "./theme.css";',
    "",
    buildThemeInlineBlock(),
    "",
  ].join("\n");

  await mkdir(DIST_DIR, { recursive: true });
  await writeFile(resolve(DIST_DIR, "theme.css"), plainCss, "utf8");
  await writeFile(resolve(DIST_DIR, "tailwind-theme.css"), tailwindCss, "utf8");
  console.log(
    `[@mari-ui/tokens] dist/theme.css (${plainCss.length} bayt) ve dist/tailwind-theme.css (${tailwindCss.length} bayt) üretildi.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
