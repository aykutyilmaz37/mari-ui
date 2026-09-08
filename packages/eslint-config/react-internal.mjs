// @mari-ui/eslint-config/react — web component kütüphanesi (`components`) için.
// React Native paketi (`native`) bunu KULLANMAZ — "use client" kuralı web'e
// (Next.js/RSC) özgüdür; native kendi `./react-native.mjs` varyantını kullanır.
import reactHooks from "eslint-plugin-react-hooks";
import { baseConfig } from "./base.mjs";
import requireUseClientWithHooks from "./rules/require-use-client-with-hooks.mjs";

const mariUiPlugin = {
  rules: {
    "require-use-client-with-hooks": requireUseClientWithHooks,
  },
};

/** @type {import('eslint').Linter.Config[]} */
export const reactInternalConfig = [
  ...baseConfig,
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
