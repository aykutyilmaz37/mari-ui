import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * `src/` altındaki, `index.ts`e sahip HER klasörü bir "component entry"
 * sayar. `tsup.config.ts` (her klasör için ayrı bir dist chunk) VE
 * `scripts/build-manifest.ts` (Faz 7 — her chunk'ın gerçek export'larını
 * introspect eder) AYNI bu fonksiyonu çağırır; discovery mantığı iki yerde
 * ayrı ayrı tutulmuyor.
 */
export function discoverEntries(srcDir: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const name of readdirSync(srcDir)) {
    const dir = join(srcDir, name);
    if (!statSync(dir).isDirectory()) continue;
    const indexPath = join(dir, "index.ts");
    try {
      if (statSync(indexPath).isFile()) {
        entries[name] = indexPath;
      }
    } catch {
      // index.ts yoksa (örn. src/lib) atla.
    }
  }
  return entries;
}
