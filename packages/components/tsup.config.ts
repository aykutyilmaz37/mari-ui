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
 * Tip bildirimleri burada üretilmez (`dts: false`). tsup'ın `dts`i her
 * entry'yi tek bir worker'da ayrı ayrı derliyordu; ~90 entry'de
 * `NODE_OPTIONS=--max-old-space-size=8192` ile bile `ERR_WORKER_OUT_OF_MEMORY`
 * (Faz 16.8) — yarıda kalan build `dist/`i temizlemiş, `styles.css` de
 * üretilmemiş oluyordu → `pnpm storybook` açılmıyordu. Artık `build:types`:
 * tek bir `tsc -p tsconfig.build.json` (→ `dist/types/`) + `dist/<entry>.d.ts`
 * yönlendirmeleri (`scripts/write-dts-entries.ts`).
 */
const SRC_DIR = join(__dirname, "src");

export default defineConfig((options) => ({
  entry: discoverEntries(SRC_DIR),
  format: ["esm"],
  // Tip bildirimleri tsup'ta DEĞİL: `build:types` (tek `tsc` + scripts/write-dts-entries.ts).
  dts: false,
  sourcemap: true,
  // `dist/` sadece tsup'ın kendi çıktılarından (JS/d.ts) ibaret değil —
  // `build:css` (Tailwind) ve `build:manifest` (ts-morph) de AYNI dizine
  // yazıyor. `clean: true` her zaman açık olsaydı `tsup --watch` (dev
  // script'i) başlarken tüm `dist/`i silip sadece kendi ürettiklerini geri
  // koyardı — `dist/styles.css` ve `dist/manifest.json` bir daha hiç
  // regenerate edilmeden dev session boyunca eksik kalırdı (fiilen
  // `apps/studio`da "Module not found: @mari-ui/components/styles.css"
  // olarak yaşandı). Tek seferlik `build`de temiz başlamak hâlâ istendiği
  // için clean sadece watch MODUNDA kapatılıyor.
  clean: !options.watch,
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
}));
