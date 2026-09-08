import { defineConfig } from "tsup";

/**
 * Web'in aksine burada `esbuild-plugin-preserve-directives` YOK — "use
 * client" React Native'de anlamsız bir kavram (bkz. eslint-config/react-
 * native.mjs). Metro geleneksel olarak CommonJS bekler; modern Metro (0.72+)
 * `exports`/ESM'i de çözebiliyor ama tüketici tarafında hangi RN sürümüyle
 * karşılaşacağımız bilinmediği için ikisini birden üretiyoruz — `components`
 * paketinin aksine burada `cjs` formatı gerçek bir ihtiyaç, gösteriş değil.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-native"],
});
