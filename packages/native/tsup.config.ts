import { join } from "node:path";
import { defineConfig } from "tsup";
import { discoverEntries } from "./scripts/entries";

/**
 * Web'in aksine burada `esbuild-plugin-preserve-directives` YOK — "use
 * client" React Native'de anlamsız bir kavram (bkz. eslint-config/react-
 * native.mjs). Metro geleneksel olarak CommonJS bekler; modern Metro (0.72+)
 * `exports`/ESM'i de çözebiliyor ama tüketici tarafında hangi RN sürümüyle
 * karşılaşacağımız bilinmediği için ikisini birden üretiyoruz — `components`
 * paketinin aksine burada `cjs` formatı gerçek bir ihtiyaç, gösteriş değil.
 */
/**
 * Bundle performansı Faz 2: her bileşen klasörü kendi entry'si
 * (dist/button.js|.cjs, `@mari-ui/native/button`) — Metro tree-shake
 * yapmadığı için tek entry'de Button'lık bir uygulama tüm paketi taşıyordu.
 * Ortak modüller (theme, lib, nativeConfig…) paylaşılan chunk'lara ayrılır;
 * context'ler (ThemeContext, NativeConfig, Toast…) böylece TEK modül örneği
 * olarak kalır — iki entry aynı context'i iki kopya halinde taşımaz.
 * `splitting` esbuild'de yalnız ESM'de var; tsup CJS için ESM split çıktısını
 * CJS'ye çevirir (`splitting: true` ile açılan, tsup'ın kendi desteği).
 */
export default defineConfig((options) => ({
  entry: discoverEntries(join(__dirname, "src")),
  format: ["esm", "cjs"],
  splitting: true,
  dts: true,
  sourcemap: true,
  // Watch modunda clean kapalı — bkz. `packages/core/tsup.config.ts`teki
  // aynı gerekçe (`pnpm dev`de tüm paketler aynı anda başladığı için bir
  // paketin dist'inin kısa süreliğine silinmesi bağımlılarının DTS
  // build'ini yarışta yakalayabiliyor).
  clean: !options.watch,
  target: "es2020",
  external: ["react", "react-native"],
}));
