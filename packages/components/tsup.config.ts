import { join } from "node:path";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";
import { defineConfig } from "tsup";
import { discoverEntries } from "./scripts/discoverEntries";

/**
 * Her component klasörü kendi chunk'ına derlenir (dist/button.js,
 * dist/card.js, ...) — bu, `@mari-ui/components/button` gibi subpath
 * export'ların gerçek, ayrı dosyalar olmasını sağlar.
 *
 * Faz 3 tamamlandı (29/29 component migrate edildi) — artık `src/`
 * altındaki HER klasör gerçek, derlenebilir bir component. Önceki
 * `migrated.json` allowlist'i (henüz migrate edilmemiş component'leri
 * build dışında tutmak için) kaldırıldı; yeni bir component eklendiğinde
 * bu dosyaya dokunmaya gerek yok.
 *
 * `package.json`'daki `build` script'i `NODE_OPTIONS=--max-old-space-size=
 * 8192` taşıyor: tsup'ın `dts:true` çıktısı 29 ayrı entry'yi tek bir
 * worker thread'de derliyor ve bu worker'ın varsayılan V8 heap limiti daha
 * yeni Node sürümlerinde (fiilen Node 25'te doğrulandı) bu iş yükü için
 * yetersiz kalıp `ERR_WORKER_OUT_OF_MEMORY` ile patlıyor — `tsup.config.ts`
 * içinden bu worker'a doğrudan `resourceLimits` geçme yolu yok, bu yüzden
 * çözüm `NODE_OPTIONS` üzerinden.
 */
const SRC_DIR = join(__dirname, "src");

export default defineConfig({
  entry: discoverEntries(SRC_DIR),
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
    preserveDirectivesPlugin({
      directives: ["use client", "use server"],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }) as never,
  ],
});
