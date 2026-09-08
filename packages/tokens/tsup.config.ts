import { defineConfig } from "tsup";

/**
 * `dist/` sadece tsup'ın (`index.js`/`index.d.ts`) çıktısı değil —
 * `build:css` (`scripts/build-css.ts` → `dist/theme.css` + `dist/
 * tailwind-theme.css`) ve `build:schema` (`scripts/build-schema.ts` →
 * `dist/schema.json`) de AYNI dizine yazıyor. `clean: true` her zaman açık
 * olsaydı `tsup --watch` (dev script'i) başlarken tüm `dist/`i silip sadece
 * kendi ürettiğini geri koyardı — `tailwind-theme.css`/`schema.json` bir
 * daha hiç regenerate edilmeden dev session boyunca eksik kalırdı (fiilen
 * `@mari-ui/components`'ın `build:css:watch`'ı `Package path
 * ./tailwind-theme.css ... no valid target file was found` hatasıyla
 * patladı — bkz. `packages/components/tsup.config.ts`'teki aynı gerekçe).
 * Tek seferlik `build`de temiz başlamak hâlâ istendiği için clean sadece
 * watch MODUNDA kapatılıyor.
 */
export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: !options.watch,
  target: "es2020",
}));
