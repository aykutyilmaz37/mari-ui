import React, { Suspense } from "react";
import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
// Component'lerin gerçekten DERLENMİŞ CSS'i — tüketicinin de import edeceği
// aynı dosya. Kaynak Tailwind class'larını değil, tam olarak paketin
// yayınlayacağı çıktıyı önizliyoruz.
import "@mari-ui/components/styles.css";

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
          ["Renkler", "Tipografi", "Spacing", "Elevation"],
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
    // Component'lerin çoğu (Button gibi) kendi kökünde bir sayfa arka planı
    // taşımaz — `solid` bir buton her iki temada da BİLİNÇLİ OLARAK aynı
    // renkte kalır (deriveColorRole'ün tasarımı). Bu sarmalayıcı olmadan
    // tema toggle'ı görsel olarak hemen hemen HİÇBİR ŞEY değiştirmiyor gibi
    // görünürdü — sayfa yüzeyini (surface/foreground) elle gösteriyoruz.
    //
    // Faz 13: autodocs ("docs") modunda `minHeight: 100vh` UYGULANMAZ — her
    // gömülü story kendi kanvasında bu sarmalayıcıyı render ettiği için
    // Playground dahil her demo bloğu bir tam ekran yüksekliğinde şişiyordu.
    // Story modunda (tek story izole) tam yükseklik hâlâ isteniyor.
    (Story, context) => {
      const isDocs = context.viewMode === "docs";
      return (
        <div
          style={{
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
