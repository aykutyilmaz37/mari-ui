import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defaultThemeConfig, type MariUiThemeConfig, type PersonaName } from "@mari-ui/tokens";

export const CONFIG_FILE_NAME = "mari-ui.config.json";

/**
 * `dist/schema.json`'daki `editable`in kendi varsayılanlarıyla BİREBİR aynı
 * — bkz. `packages/tokens/scripts/build-schema.ts`. `themes`
 * BİLİNÇLİ OLARAK burada YOK: opsiyonel, opt-in bir alan — taze bir
 * `mari-ui.config.json`ı gereksiz bir `"themes": {}` satırıyla
 * kirletmemek için varsayılan çıktıdan çıkarıldı (yine de `MariUiThemeConfig`
 * tipinde geçerli, tüketici isterse elle ekler).
 */
export const DEFAULT_CONFIG = defaultThemeConfig;

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

/**
 * `init --persona`. Dosya yoksa YALNIZ `{ "persona": … }` yazılır: her şey
 * kişilikten gelir, açıkça yazılan alanlar ileride onu ezer. Dosya varsa yalnız
 * `persona` alanı eklenir/değişir — kullanıcının diğer seçimlerine dokunulmaz
 * (bayrak açık bir istek olduğu için idempotent kuralın tek istisnası bu alan).
 */
export function writePersonaConfig(targetDir: string, persona: PersonaName): { created: boolean; updated: boolean; path: string } {
  const path = configFilePath(targetDir);
  if (!existsSync(path)) {
    writeFileSync(path, `${JSON.stringify({ persona }, null, 2)}\n`, "utf8");
    return { created: true, updated: false, path };
  }
  const current = JSON.parse(readFileSync(path, "utf8")) as MariUiThemeConfig;
  if (current.persona === persona) return { created: false, updated: false, path };
  // `persona` en üstte dursun (okunurluk): önce o, sonra mevcut alanlar, sonra yeni değer.
  writeFileSync(path, `${JSON.stringify(Object.assign({ persona }, current, { persona }), null, 2)}\n`, "utf8");
  return { created: false, updated: true, path };
}
