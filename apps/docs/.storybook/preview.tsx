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
  // Native story'lerinin font kipi (ThemeProvider `fonts`): "system" varsayılan,
  // "brand" Geist/Manrope — web component'leriyle birebir karşılaştırmak için.
  globalTypes: {
    fonts: {
      description: "Native font kipi",
      toolbar: {
        title: "Native font",
        icon: "paragraph",
        items: [
          { value: "system", title: "Sistem fontu" },
          { value: "brand", title: "Marka fontu (Geist)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { fonts: "system" },
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
      /**
       * Kenar çubuğu düzeni: kategoriler sabit sırada; kategori içinde bileşenler
       * Türkçe alfabetik (eskiden dosya yoluna göreydi — `menu/` altındakiler
       * araya giriyordu); bileşen içinde önce doküman, sonra dosyadaki sıra
       * (Playground → senaryolar → görünüm → Durumlar → İskelet).
       * Storybook bu fonksiyonu serileştirir: dış değişkene başvurmamalı.
       */
      // Storybook bu fonksiyonu KAYNAK METİN olarak alıp çalıştırır: içinde TypeScript tipi olamaz.
      // @ts-expect-error -- parametreler bilinçli olarak tipsiz (tip açıklaması dizinlemeyi bozar)
      storySort: (a, b) => {
        const categories = ["Genel Bakış", "Foundations", "Genel", "Navigasyon", "Veri Girişi", "Veri Gösterimi", "Geri Bildirim", "Native"];
        const foundations = ["Yumuşak İris", "Marka", "Renkler", "Tipografi", "Spacing", "Elevation"];
        const pa = a.title.split("/");
        const pb = b.title.split("/");
        // Listede olmayan öğe sona: `[...liste, v].indexOf(v)` = yoksa liste uzunluğu.
        if (pa[0] !== pb[0]) return [...categories, pa[0]].indexOf(pa[0]) - [...categories, pb[0]].indexOf(pb[0]);
        if (pa[1] !== pb[1] && pa[0] === "Foundations") return [...foundations, pa[1]].indexOf(pa[1]) - [...foundations, pb[1]].indexOf(pb[1]);
        if (pa[1] !== pb[1]) return String(pa[1]).localeCompare(String(pb[1]), "tr");
        if (a.type !== b.type) return a.type === "docs" ? -1 : 1;
        return 0;
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
