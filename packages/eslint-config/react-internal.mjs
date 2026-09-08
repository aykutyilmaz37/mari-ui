// @mari-ui/eslint-config/react — web component kütüphanesi (`components`) için.
// React Native paketi (`native`) bunu KULLANMAZ — "use client" kuralı web'e
// (Next.js/RSC) özgüdür; native kendi `./react-native.mjs` varyantını kullanır.
// Aynı gerekçeyle `jsx-a11y` de SADECE burada: kuralları HTML ARIA
// attribute'larını/rollerini denetliyor (`aria-*`, `role="button"`, `<img
// alt>`, ...) — React Native'in kendi erişilebilirlik API'si (`accessibilityLabel`,
// `accessibilityRole`) tamamen farklı, bu kurallar orada anlamsız kalırdı.
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import { baseConfig } from "./base.mjs";
import requireUseClientWithHooks from "./rules/require-use-client-with-hooks.mjs";

const mariUiPlugin = {
  rules: {
    "require-use-client-with-hooks": requireUseClientWithHooks,
  },
};

/**
 * Faz 9 (backlog madde 14 — erişilebilirlik disiplini): Faz 4'te eklenen
 * `@storybook/addon-a11y` sadece Storybook'u AÇIP GÖZLE bakıldığında
 * çalışıyordu — kimse otomatik çalıştırmıyorsa hiç görünmezdi. `jsx-a11y`
 * AYNI sınıf hataları (eksik `alt`, geçersiz ARIA rolü, klavyeyle
 * erişilemeyen interaktif element, ...) `pnpm lint`e (ve artık CI'a, bkz.
 * Faz 8) bağlıyor — derleme zamanında, gözle bakmaya gerek kalmadan.
 */
/** @type {import('eslint').Linter.Config[]} */
export const reactInternalConfig = [
  ...baseConfig,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "mari-ui": mariUiPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "mari-ui/require-use-client-with-hooks": "error",
    },
  },
  {
    // Story, test dosyaları ve tip tanımları bu kuraldan muaftır — bunlar
    // kütüphanenin tüketiciye dağıttığı component'ler değil.
    files: ["**/*.stories.tsx", "**/*.d.ts", "**/types.ts", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "mari-ui/require-use-client-with-hooks": "off",
    },
  },
];

export default reactInternalConfig;
