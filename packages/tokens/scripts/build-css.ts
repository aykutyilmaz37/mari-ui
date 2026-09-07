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
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { darkTheme, lightTheme, type Theme } from "../src/theme";
import type { SemanticColorRole } from "../src/semantic/deriveColorRole";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, "../dist");

function colorRoleToVars(prefix: string, role: SemanticColorRole): string[] {
  return [
    `  --mari-color-${prefix}: ${role.text};`,
    `  --mari-color-${prefix}-solid: ${role.solid};`,
    `  --mari-color-${prefix}-solid-contrast: ${role.solidContrast};`,
    `  --mari-color-${prefix}-solid-hover: ${role.solidHover};`,
    `  --mari-color-${prefix}-subtle: ${role.subtle};`,
    `  --mari-color-${prefix}-subtle-contrast: ${role.subtleContrast};`,
    `  --mari-color-${prefix}-border: ${role.border};`,
  ];
}

function themeToVarLines(theme: Theme): string[] {
  const lines: string[] = [];
  for (const role of ["primary", "accent", "success", "error", "warning", "info"] as const) {
    lines.push(...colorRoleToVars(role, theme.color[role]));
  }
  const n = theme.color.neutral;
  lines.push(
    `  --mari-color-surface: ${n.surface};`,
    `  --mari-color-surface-alt: ${n.surfaceAlt};`,
    `  --mari-color-border: ${n.border};`,
    `  --mari-color-foreground: ${n.foreground};`,
    `  --mari-color-muted: ${n.muted};`,
    `  --mari-color-disabled: ${n.disabled};`
  );
  return lines;
}

function nonColorVarLines(theme: Theme): string[] {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(theme.spacing)) lines.push(`  --mari-space-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.radius)) lines.push(`  --mari-radius-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.fontSize)) lines.push(`  --mari-font-size-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.fontWeight)) lines.push(`  --mari-font-weight-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.lineHeight)) lines.push(`  --mari-line-height-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.shadow)) lines.push(`  --mari-shadow-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.zIndex)) lines.push(`  --mari-z-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.duration)) lines.push(`  --mari-duration-${key}: ${value};`);
  for (const [key, value] of Object.entries(theme.easing)) lines.push(`  --mari-easing-${key}: ${value};`);
  lines.push(`  --mari-font-sans: ${theme.fontFamily.sans};`);
  lines.push(`  --mari-font-mono: ${theme.fontFamily.mono};`);
  return lines;
}

const THEME_TOKEN_KEYS = [
  ...["primary", "accent", "success", "error", "warning", "info"].flatMap((role) => [
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
    (key) => `  --spacing-mari-${key}: var(--mari-space-${key});`
  );
  const radiusLines = Object.keys(lightTheme.radius).map(
    (key) => `  --radius-mari-${key}: var(--mari-radius-${key});`
  );
  return ["@theme inline {", ...colorLines, ...spacingLines, ...radiusLines, "}"].join("\n");
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
    ...themeToVarLines(lightTheme),
    ...nonColorVarLines(lightTheme),
    "}",
    "",
    '[data-theme="dark"] {',
    ...themeToVarLines(darkTheme),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    '  :root:not([data-theme="light"]) {',
    ...themeToVarLines(darkTheme).map((l) => `  ${l}`),
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
