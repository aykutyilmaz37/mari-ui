import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Eskiden framework `@storybook/nextjs` idi ve `nextConfigPath: "../next.config.ts"`
 * diye SİLİNMİŞ bir dosyaya işaret ediyordu (o Next.js uygulaması Faz 0'da
 * kaldırıldı — bkz. plan). `@mari-ui/components` artık bağımsız bir kütüphane,
 * Next'e bağlı değil; bu yüzden framework de daha basit, daha hızlı olan
 * `@storybook/react-vite`'a geçirildi.
 *
 * Story'ler artık `apps/docs/src` altında değil — component'ler
 * `packages/components/src/**` içinde yaşıyor (Faz 0'da taşındı), story
 * dosyaları da onlarla aynı klasörde.
 */
const config: StorybookConfig = {
  stories: [
    "../../../packages/components/src/**/*.mdx",
    "../../../packages/components/src/**/*.stories.@(ts|tsx)",
    "../../../packages/native/src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Faz 13: autodocs sekmesi Türkçe ("Docs" yerine "Doküman"); her component'in
  // `tags: ["autodocs"]` taşıması yeterli (makeMeta zaten ekliyor).
  docs: { defaultName: "Doküman" },
  staticDirs: ["../public", "../../../assets/brand"],
  // Native bölümü (kullanıcı kararı 2026-10-05, "B"): `@mari-ui/native` story'leri
  // react-native-web ile tarayıcıda çizilir. Aynı story dosyalarını native-studio
  // (Expo) telefonda gösterir — tek kaynak. `@mari-ui/native` KAYNAKTAN çözülür
  // (story'ler de kaynaktan import ettiği için tek modül kopyası → tek ThemeContext).
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = [
      ...(Array.isArray(viteConfig.resolve.alias) ? viteConfig.resolve.alias : Object.entries(viteConfig.resolve.alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string }))),
      { find: /^react-native$/, replacement: "react-native-web" },
      { find: /^@mari-ui\/native$/, replacement: path.resolve(__dirname, "../../../packages/native/src/index.ts") },
    ];
    // react-native-web platform uzantıları + RN kodunun beklediği global.
    const webFirst = [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".mjs", ".js", ".jsx", ".json"];
    viteConfig.resolve.extensions = webFirst;
    // Bağımlılık ön-paketlemesi (Vite 8 / rolldown) da `.web.js`i önce seçmeli —
    // yoksa react-native-svg'nin native dosyaları (react-native'in Flow iç dosyalarını
    // import eden) paketlenmeye çalışılıyor ve Storybook açılmıyor.
    viteConfig.optimizeDeps ??= {};
    const optimize = viteConfig.optimizeDeps as { rolldownOptions?: { resolve?: Record<string, unknown> } };
    optimize.rolldownOptions = { ...optimize.rolldownOptions, resolve: { ...optimize.rolldownOptions?.resolve, extensions: webFirst } };
    viteConfig.define = { ...viteConfig.define, __DEV__: JSON.stringify(process.env.NODE_ENV !== "production") };
    // Faz 3: story sınıfları yayın CSS'inde değil, docs'un kendi girişinde (`stories.css`).
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    // Prop tablosu üreten react-docgen, native tiplerini izlerken `react-native`in
    // Flow sözdizimli kaynağına iniyor ve ayrıştıramıyor (story yüklenmiyordu).
    // Yalnız packages/native için atlanır; native kontrolleri story `argTypes`ından gelir.
    type TransformHook = (this: unknown, code: string, id: string, ...rest: unknown[]) => unknown;
    for (const plugin of (viteConfig.plugins ?? []).flat()) {
      if (!plugin || typeof plugin !== "object" || !("name" in plugin) || plugin.name !== "storybook:react-docgen-plugin") continue;
      const hooks = plugin as { transform?: TransformHook };
      const transform = hooks.transform;
      if (typeof transform !== "function") continue;
      hooks.transform = function (code, id, ...rest) {
        if (id.includes("/packages/native/")) return undefined;
        return transform.call(this, code, id, ...rest);
      };
    }
    return viteConfig;
  },
  // pnpm workspace paketlerini (@mari-ui/core, @mari-ui/tokens) kaynak
  // değil DERLENMİŞ dist çıktısı üzerinden çözmek için ekstra bir Vite
  // ayarı gerekmiyor — normal node_modules symlink çözümlemesi yeterli,
  // ama bu paketlerin `pnpm build` ile önceden derlenmiş olması gerekiyor
  // (turbo.json'daki `storybook` görevi `dependsOn: ["^build"]` ile
  // bunu garanti ediyor).
};

export default config;
