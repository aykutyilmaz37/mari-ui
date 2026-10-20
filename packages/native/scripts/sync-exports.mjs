// package.json `exports` + `publishConfig.exports`ı src'deki entry'lerden yazar.
// Yeni bir bileşen klasörü eklendiğinde: `pnpm --filter @mari-ui/native sync:exports`.
// Unutulursa `src/__tests__/exports.test.ts` kırılır.
/* global console */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishedExports, workspaceExports } from "./entries.ts";

const root = join(import.meta.dirname, "..");
const pkgFile = join(root, "package.json");
const src = join(root, "src");
const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
pkg.exports = workspaceExports(src);
pkg.publishConfig = { ...pkg.publishConfig, exports: publishedExports(src) };
writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`exports yazıldı: ${Object.keys(pkg.exports).length} subpath`);
