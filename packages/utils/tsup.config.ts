import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", datalayer: "src/datalayer/index.ts", captcha: "src/captcha/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
});
