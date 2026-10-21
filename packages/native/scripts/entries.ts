import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Native paketinin build entry'leri ve subpath export'ları TEK yerden
 * (bundle performansı Faz 2). `tsup.config.ts` (dist/<ad>.js|.cjs),
 * `scripts/sync-exports.mjs` (package.json `exports` yazımı) ve
 * `src/__tests__/exports.test.ts` (unutulan export kilidi) aynı fonksiyonu
 * çağırır — web'deki `packages/components/scripts/discoverEntries.ts`in eşi.
 *
 * Kural: `src/` altında `index.ts`e sahip her klasör bir entry; ad kebab-case
 * (`InputNumber` → `input-number`, `QRCode` → `qrcode`), web'deki subpath
 * adlarıyla aynı. `index.ts`i olmayan `lib/`, `styles/` atlanır. Kök barrel
 * (`index`) ve klasör olmayan modüller (`config`) elle eklenir.
 */

/** Klasörü olmayan ya da başka adla yayınlanan entry'ler: subpath → src'ye göre dosya. */
const EXTRA_ENTRIES: Record<string, string> = {
  config: "nativeConfig.tsx",
};

/** Entry sayılmayan klasörler (yayınlanmaz ya da ayrı export'u var). */
const SKIP = new Set(["stories", "__tests__"]);

export function toSubpath(folder: string): string {
  return folder.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** dist dosya adı → kaynak dosya. `index` kök barrel'dır (`"."`). */
export function discoverEntries(srcDir: string): Record<string, string> {
  const entries: Record<string, string> = { index: join(srcDir, "index.ts") };
  for (const name of readdirSync(srcDir).sort((a, b) => a.localeCompare(b))) {
    if (SKIP.has(name)) continue;
    const dir = join(srcDir, name);
    if (!statSync(dir).isDirectory()) continue;
    const indexPath = join(dir, "index.ts");
    try {
      if (statSync(indexPath).isFile()) entries[toSubpath(name)] = indexPath;
    } catch {
      // index.ts yoksa (örn. src/lib) entry değil.
    }
  }
  for (const [subpath, file] of Object.entries(EXTRA_ENTRIES)) entries[subpath] = join(srcDir, file);
  return entries;
}

type ExportTarget = { types: string; import: string; require: string };

function target(name: string): ExportTarget {
  return { types: `./dist/${name}.d.ts`, import: `./dist/${name}.js`, require: `./dist/${name}.cjs` };
}

/**
 * Yayınlanan `exports`: kök barrel + her entry. `./stories` yalnız monorepo
 * içi (src'yi gösterir, `files`a girmez) — `publishConfig.exports`ta yok.
 */
export function publishedExports(srcDir: string): Record<string, ExportTarget | string> {
  const exports: Record<string, ExportTarget | string> = { ".": target("index") };
  for (const name of Object.keys(discoverEntries(srcDir))) {
    if (name !== "index") exports[`./${name}`] = target(name);
  }
  exports["./manifest.json"] = "./dist/manifest.json";
  exports["./package.json"] = "./package.json";
  return exports;
}

/** Workspace içi `exports`: yayınlananlar + `./stories` (kaynak). */
export function workspaceExports(srcDir: string): Record<string, unknown> {
  const { "./manifest.json": manifest, "./package.json": pkgJson, ...rest } = publishedExports(srcDir);
  return {
    ...rest,
    "./stories": { types: "./src/stories/registry.ts", default: "./src/stories/registry.ts" },
    "./manifest.json": manifest,
    "./package.json": pkgJson,
  };
}
