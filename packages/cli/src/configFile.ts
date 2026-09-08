import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MariUiThemeConfig } from "@mari-ui/tokens";

export const CONFIG_FILE_NAME = "mari-ui.config.json";

/** `dist/schema.json`'daki `editable`in kendi varsayılanlarıyla BİREBİR aynı — bkz. `packages/tokens/scripts/build-schema.ts`. */
export const DEFAULT_CONFIG: Required<MariUiThemeConfig> = {
  color: { primary: "#2563eb", accent: "#f97316" },
  typography: {
    fontFamilySans: "var(--mari-font-sans, ui-sans-serif, system-ui, -apple-system, sans-serif)",
    fontFamilyMono: "var(--mari-font-mono, ui-monospace, SFMono-Regular, monospace)",
  },
  density: { radius: "md" },
};

export function configFilePath(targetDir: string): string {
  return join(targetDir, CONFIG_FILE_NAME);
}

/** Config dosyası yoksa DEFAULT_CONFIG'i döner — `mari-ui init` çalıştırılmamış bir projede bile `sync`/`theme` çalışabilsin diye. */
export function readConfig(targetDir: string, explicitPath?: string): MariUiThemeConfig {
  const path = explicitPath ?? configFilePath(targetDir);
  if (!existsSync(path)) return DEFAULT_CONFIG;
  return JSON.parse(readFileSync(path, "utf8")) as MariUiThemeConfig;
}

/** Var olan bir config'in üzerine YAZMAZ — `init` idempotent olmalı, ikinci çalıştırma kullanıcının tema seçimlerini SİLMEMELİ. */
export function writeDefaultConfigIfMissing(targetDir: string): { created: boolean; path: string } {
  const path = configFilePath(targetDir);
  if (existsSync(path)) return { created: false, path };
  writeFileSync(path, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, "utf8");
  return { created: true, path };
}
