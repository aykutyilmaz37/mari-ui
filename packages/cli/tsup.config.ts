import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: { index: "src/index.ts", cli: "src/cli.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  // Watch modunda clean kapalı — bkz. `packages/core/tsup.config.ts`teki
  // aynı gerekçe.
  clean: !options.watch,
  target: "node20",
  external: ["@mari-ui/tokens"],
}));
