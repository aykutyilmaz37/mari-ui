import { defineConfig } from "tsup";

/**
 * Web'in aksine burada `esbuild-plugin-preserve-directives` YOK — "use
 * client" React Native'de anlamsız bir kavram (bkz. eslint-config/react-
 * native.mjs). Metro geleneksel olarak CommonJS bekler; modern Metro (0.72+)
 * `exports`/ESM'i de çözebiliyor ama tüketici tarafında hangi RN sürümüyle
 * karşılaşacağımız bilinmediği için ikisini birden üretiyoruz — `components`
 * paketinin aksine burada `cjs` formatı gerçek bir ihtiyaç, gösteriş değil.
 */
export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
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
