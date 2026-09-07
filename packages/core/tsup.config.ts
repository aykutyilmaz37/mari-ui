import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react"],
  // tsup'ın altında yattığı esbuild, birden fazla dosyayı tek chunk'a
  // bundle ederken dosya başına "use client" direktiflerini SESSİZCE SİLER
  // (bu repoda fiilen doğrulandı — bkz. plan Faz 3 riskleri). Bu plugin,
  // direktifi taşıyan her modülün koptuğu chunk'ın başına geri yazar.
  esbuildPlugins: [
    preserveDirectivesPlugin({
      directives: ["use client", "use server"],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }),
  ],
});
