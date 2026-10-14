import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildPlainThemeCss, personaFontsUrl, resolveThemeConfig } from "@mari-ui/tokens";
import { readConfig } from "./configFile";

export const THEME_CSS_FILE_NAME = "mari-ui-theme.css";
export const THEME_TS_FILE_NAME = "mari-ui-theme.ts";

export interface ThemeCommandOptions {
  targetDir: string;
  configPath?: string;
  /** Varsayılan: `targetDir`in kendisi. */
  outDir?: string;
  check?: boolean;
}

export interface ThemeCommandResult {
  cssPath: string;
  themeTsPath: string;
  cssContent: string;
  themeTsContent: string;
  /** `check: true` iken: iki dosyadan en az biri bayatsa `true`. */
  stale?: boolean;
  /** Faz 21 — config'te kişilik varsa fontlarının Google Fonts adresi (CSS'e eklenmez; uygulama bilerek yükler). */
  fontsUrl?: string;
}

const CONFIG_FILE_HINT = "mari-ui.config.json";
const HEADER = ["/**", " * ÜRETİLMİŞ DOSYA — elle düzenlemeyin.", ` * "npx @mari-ui/cli theme" ile ${CONFIG_FILE_HINT}'dan üretildi.`, " */", ""].join(
  "\n"
);

function buildThemeTsContent(resolved: ReturnType<typeof resolveThemeConfig>): string {
  return [
    "// ÜRETİLMİŞ DOSYA — elle düzenlemeyin. \"npx @mari-ui/cli theme\" ile mari-ui.config.json'dan üretildi.",
    "// @mari-ui/native (veya token değerlerine doğrudan erişmek isteyen başka bir platform) için.",
    `export const mariTheme = ${JSON.stringify(
      { light: resolved.light, dark: resolved.dark, themes: resolved.themes, radiusDensity: resolved.radiusDensity, spacingDensity: resolved.spacingDensity },
      null,
      2
    )} as const;`,
    "",
  ].join("\n");
}

/**
 * `mari-ui.config.json`ı gerçek CSS'e (web) ve bir TS token objesine
 * (native/başka platformlar) çözer. `resolveThemeConfig`/`buildPlainThemeCss`
 * `@mari-ui/tokens`ın KENDİ build script'inin (`scripts/build-css.ts`, paketin
 * varsayılan teması için) kullandığı AYNI fonksiyonlardır — mantık burada
 * ikinci kez yazılmıyor (bkz. `packages/tokens/src/cssOutput.ts`teki not).
 *
 * Faz 10 (backlog madde 10 — 3. tema desteği): `config.themes`teki HER ek
 * isimli tema de (varsa) aynı CSS çıktısına `[data-theme="<isim>"]` olarak
 * eklenir — tüketici `mari-ui.config.json`a bir `themes.brand` girdisi
 * eklemesi yeterli, CLI'ı ayrıca çağırmasına gerek yok.
 */
export function runThemeCommand(options: ThemeCommandOptions): ThemeCommandResult {
  const { targetDir, configPath, outDir = targetDir, check = false } = options;
  const config = readConfig(targetDir, configPath);
  const resolved = resolveThemeConfig(config);

  const cssContent = buildPlainThemeCss({ default: resolved.light, named: { dark: resolved.dark, ...resolved.themes } }, { header: HEADER, spacingDensity: resolved.spacingDensity, fluidRootMax: resolved.fluidRootMax });
  const themeTsContent = buildThemeTsContent(resolved);

  const cssPath = join(outDir, THEME_CSS_FILE_NAME);
  const themeTsPath = join(outDir, THEME_TS_FILE_NAME);
  const fontsUrl = config.persona ? personaFontsUrl(config.persona) : undefined;

  if (check) {
    const cssStale = !existsSync(cssPath) || readFileSync(cssPath, "utf8") !== cssContent;
    const tsStale = !existsSync(themeTsPath) || readFileSync(themeTsPath, "utf8") !== themeTsContent;
    return { cssPath, themeTsPath, cssContent, themeTsContent, stale: cssStale || tsStale, fontsUrl };
  }

  mkdirSync(dirname(cssPath), { recursive: true });
  writeFileSync(cssPath, cssContent, "utf8");
  writeFileSync(themeTsPath, themeTsContent, "utf8");

  return { cssPath, themeTsPath, cssContent, themeTsContent, fontsUrl };
}
