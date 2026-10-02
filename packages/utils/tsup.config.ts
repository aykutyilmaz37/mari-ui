import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: { index: "src/index.ts", datalayer: "src/datalayer/index.ts", captcha: "src/captcha/index.ts", asset: "src/asset/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  // Watch modunda clean kapalı — bkz. `packages/core/tsup.config.ts`teki
  // aynı gerekçe.
  clean: !options.watch,
  target: "es2020",
}));
