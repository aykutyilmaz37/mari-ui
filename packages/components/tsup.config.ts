import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";
import { defineConfig } from "tsup";

/**
 * Her component klasörü kendi chunk'ına derlenir (dist/button.js,
 * dist/card.js, ...) — bu, `@mari-ui/components/button` gibi subpath
 * export'ların gerçek, ayrı dosyalar olmasını sağlar.
 *
 * Entry listesi `migrated.json`'dan okunur (src/ altını taramaz): henüz
 * migrate edilmemiş 28 component hâlâ eski `@/` path alias'ına ve
 * Next.js paketlerine (next/navigation, next/image) bağımlı — bunları
 * bundle etmeye çalışmak build'i kırar. Bir component migrate edildikçe
 * `migrated.json`'a eklenir.
 */
const SRC_DIR = join(__dirname, "src");
const MIGRATED = JSON.parse(readFileSync(join(__dirname, "migrated.json"), "utf8")).components as string[];

function findComponentEntries(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const name of MIGRATED) {
    const indexPath = join(SRC_DIR, name, "index.ts");
    if (statSync(indexPath).isFile()) {
      entries[name] = indexPath;
    }
  }
  return entries;
}

export default defineConfig({
  entry: findComponentEntries(),
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom", "@mari-ui/core", "@mari-ui/tokens"],
  // tsup/esbuild birden fazla dosyayı bundle ederken "use client"
  // direktifini sessizce siler (bkz. @mari-ui/core'da fiilen doğrulanan
  // regresyon). Bu plugin her chunk'ın başına doğru direktifi geri yazar.
  esbuildPlugins: [
    // `as never`: tsup kendi iç `esbuild` kopyasını taşıyor, bu monorepo'daki
    // ayrı `esbuild` kurulumuyla type-level'da (yapısal olarak aynı,
    // isimsel olarak farklı) çakışıyor — zararsız bir sürüm-gölgeleme sorunu.
    preserveDirectivesPlugin({
      directives: ["use client", "use server"],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }) as never,
  ],
});
