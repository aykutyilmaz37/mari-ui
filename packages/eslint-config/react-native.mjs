// @mari-ui/eslint-config/native — @mari-ui/native için.
//
// `react-internal.mjs`ten (web/`components`) TEK kasıtlı farkı:
// `require-use-client-with-hooks` kuralı burada YOK. "use client" React
// Server Components'e (Next.js/web) özgü bir direktiftir; React Native'de
// hiçbir anlamı yoktur — bu paketin hiçbir dosyasında beklenmemeli/olmamalı.
// `core`'un aksine burada `react-native` import'unu kısıtlayan bir
// `no-restricted-imports` de yok — bu paketin var oluş sebebi tam olarak bu.
import reactHooks from "eslint-plugin-react-hooks";
import { baseConfig } from "./base.mjs";

/** @type {import('eslint').Linter.Config[]} */
export const reactNativeConfig = [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];

export default reactNativeConfig;
