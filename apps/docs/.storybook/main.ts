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
  // pnpm workspace paketlerini (@mari-ui/core, @mari-ui/tokens) kaynak
  // değil DERLENMİŞ dist çıktısı üzerinden çözmek için ekstra bir Vite
  // ayarı gerekmiyor — normal node_modules symlink çözümlemesi yeterli,
  // ama bu paketlerin `pnpm build` ile önceden derlenmiş olması gerekiyor
  // (turbo.json'daki `storybook` görevi `dependsOn: ["^build"]` ile
  // bunu garanti ediyor).
};

export default config;
