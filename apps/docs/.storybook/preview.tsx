import React, { Suspense } from "react";
import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
// Component'lerin gerçekten DERLENMİŞ CSS'i — tüketicinin de import edeceği
// aynı dosya. Kaynak Tailwind class'larını değil, tam olarak paketin
// yayınlayacağı çıktıyı önizliyoruz.
import "@mari-ui/components/styles.css";

/**
 * Eskiden `preview.ts` ve `preview.tsx` birlikte vardı — hangisinin
 * kazandığı belirsizdi (bkz. plan denetimi). Biri silindi, bu dosya tek
 * kaynak. `docs: false` main.ts'ten kaldırıldığı için autodocs artık
 * gerçekten çalışıyor (30 story dosyasının zaten taşıdığı
 * `tags: ["autodocs"]` nihayet bir şey yapıyor).
 *
 * Tema geçişi `data-theme` attribute'u üzerinden — `@mari-ui/tokens`'ın
 * ürettiği CSS tam olarak bunu bekliyor (`[data-theme="dark"]` selector'ü),
 * eski `.dark` class'ı değil.
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
        order: ["Foundations", ["Renkler", "Tipografi", "Spacing"], "Components"],
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
    (Story) => (
      <div style={{ background: "var(--mari-color-surface)", color: "var(--mari-color-foreground)", minHeight: "100vh", padding: "1.5rem" }}>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <Story />
        </Suspense>
      </div>
    ),
  ],
};

export default preview;
