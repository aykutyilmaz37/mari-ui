import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MariUiThemeConfig } from "@mari-ui/tokens";

export const CONFIG_FILE_NAME = "mari-ui.config.json";

/**
 * `dist/schema.json`'daki `editable`in kendi varsayılanlarıyla BİREBİR aynı
 * — bkz. `packages/tokens/scripts/build-schema.ts`. `themes` (Faz 10)
 * BİLİNÇLİ OLARAK burada YOK: opsiyonel, opt-in bir alan — taze bir
 * `mari-ui.config.json`ı gereksiz bir `"themes": {}` satırıyla
 * kirletmemek için varsayılan çıktıdan çıkarıldı (yine de `MariUiThemeConfig`
 * tipinde geçerli, tüketici isterse elle ekler).
 */
export const DEFAULT_CONFIG: Required<Omit<MariUiThemeConfig, "themes">> = {
  color: { primary: "#88bdf2", accent: "#6a89a7" },
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
