import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  // Watch modunda `clean: true` her yeniden başlatmada `dist/`i (ve o anki
  // `.d.ts`i) kısa süreliğine siler; `pnpm dev` tüm paketleri aynı anda
  // ayağa kaldırdığında `@mari-ui/components`in DTS build'i tam bu silme
  // penceresine denk gelip "Could not find a declaration file" hatasıyla
  // patlayabiliyor (fiilen görüldü). Tek seferlik `build`de temiz başlamak
  // hâlâ isteniyor, o yüzden clean sadece watch modunda kapatılıyor —
  // bkz. `packages/components/tsup.config.ts`teki aynı gerekçe.
  clean: !options.watch,
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
}));
