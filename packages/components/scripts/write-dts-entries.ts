import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverEntries } from "./discoverEntries";

/**
 * `package.json` export'ları `./dist/<entry>.d.ts` bekler; tip bildirimleri ise
 * tek bir `tsc -p tsconfig.build.json` ile `dist/types/<entry>/…` altına üretilir
 * (tsup'ın `dts`i ~90 entry'de 8GB'da bile OOM oluyordu). Bu betik her entry için
 * ince bir yönlendirme dosyası yazar.
 */
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const entries = Object.keys(discoverEntries(join(PACKAGE_ROOT, "src")));
for (const name of entries) {
  writeFileSync(join(PACKAGE_ROOT, "dist", `${name}.d.ts`), `export * from "./types/${name}/index";\n`);
}
console.log(`[@mari-ui/components] ${entries.length} entry için dist/<entry>.d.ts yazıldı.`);
