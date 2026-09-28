import React, { Suspense } from "react";
import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
// Component'lerin gerçekten DERLENMİŞ CSS'i — tüketicinin de import edeceği
// aynı dosya. Kaynak Tailwind class'larını değil, tam olarak paketin
// yayınlayacağı çıktıyı önizliyoruz.
import "@mari-ui/tokens/fonts.css";
import "@mari-ui/components/styles.css";
import "./preview.css";
import { DocsContainer } from "./DocsContainer";

/**
 * Tema geçişi `data-theme` attribute'u üzerinden — `@mari-ui/tokens`'ın
 * ürettiği CSS tam olarak bunu bekliyor (`[data-theme="dark"]` selector'ü),
 * eski `.dark` class'ı değil.
 *
 * Faz 13 (madde 18): sidebar ant.design/components düzenine geçti — üstte
 * "Genel Bakış" + "Foundations", sonra ant kategorileri (Genel / Navigasyon /
 * Veri Girişi / Veri Gösterimi / Geri Bildirim). Story dosyaları bu kategori
 * öneklerini `makeMeta` (packages/components/src/lib/storyMeta.ts) üzerinden
 * alıyor.
 */
const preview: Preview = {
  parameters: {
    docs: { container: DocsContainer },
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Genel Bakış",
          "Foundations",
          ["Yumuşak İris", "Marka", "Renkler", "Tipografi", "Spacing", "Elevation"],
          "Genel",
          "Navigasyon",
          "Veri Girişi",
          "Veri Gösterimi",
          "Geri Bildirim",
        ],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
    // Story ve gömülü docs örnekleri aynı tema ve font kaynağını kullanır.
    (Story, context) => {
      const isDocs = context.viewMode === "docs";
      return (
        <div
          style={{
            fontFamily: "var(--mari-font-sans)",
            background: "var(--mari-color-surface)",
            color: "var(--mari-color-foreground)",
            minHeight: isDocs ? "auto" : "100vh",
            padding: isDocs ? "1rem" : "1.5rem",
          }}
        >
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <Story />
          </Suspense>
        </div>
      );
    },
  ],
};

export default preview;
