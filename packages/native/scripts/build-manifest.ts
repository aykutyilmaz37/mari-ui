/**
 * `@mari-ui/native` için `dist/manifest.json` üretir (CLI platform planı,
 * Faz B). Şema ve introspection web'dekiyle AYNI — fonksiyonlar
 * `packages/components/scripts/build-manifest.ts`ten paylaşılır, yalnız
 * hedef (`importPath` öneki + "kendi" prop klasörleri) değişir. Böylece CLI
 * iki manifest'i aynı kodla okur. Subpath listesi `scripts/entries.ts`ten:
 * tsup ve `exports` ile aynı kaynak. Kök barrel (`index`) atlanır — her
 * component zaten kendi subpath'iyle yer alır.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Project } from "ts-morph";
import { type ComponentInfo, extractAxes, type ManifestTarget, resolveComponents } from "../../components/scripts/build-manifest";
import { discoverEntries } from "./entries";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, "..");
const SRC_DIR = join(PACKAGE_ROOT, "src");
const OUT_FILE = join(PACKAGE_ROOT, "dist/manifest.json");

export const NATIVE_TARGET: ManifestTarget = {
  packageName: "@mari-ui/native",
  ownSrcDirs: ["/packages/native/src/", "/packages/core/src/"],
};

export function buildManifest(project: Project = new Project({ tsConfigFilePath: join(PACKAGE_ROOT, "tsconfig.json") })) {
  const components: ComponentInfo[] = [];
  for (const [subpath, file] of Object.entries(discoverEntries(SRC_DIR))) {
    if (subpath === "index") continue;
    for (const component of resolveComponents(project, subpath, file, NATIVE_TARGET)) {
      // React Native'de server/client ayrımı yok.
      components.push({ ...component, requiresUseClient: false });
    }
  }
  components.sort((a, b) => a.name.localeCompare(b.name));

  return {
    $schema: "https://mari-ui.dev/schema/manifest.schema.json",
    version: 1,
    generatedFrom: "packages/native/scripts/entries.ts + packages/core/src/types/common.ts (ts-morph introspection, bkz. scripts/build-manifest.ts)",
    axes: extractAxes(project),
    components,
  };
}

async function main() {
  const manifest = buildManifest();
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[@mari-ui/native] dist/manifest.json üretildi (${manifest.components.length} component export'u).`);
}

// Testin `buildManifest`i import etmesi dist'i yeniden yazmasın (web'deki koruma).
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
