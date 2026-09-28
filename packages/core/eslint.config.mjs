import { reactInternalConfig } from "@mari-ui/eslint-config/react";

/**
 * `core → {components, native}` tek yönlü bağımlılık kuralı burada
 * zorlanıyor: bu paket JSX render etmez, `react-dom` veya `react-native`
 * import edemez. Bu kural olmadan "headless" sözleşmesi sadece bir
 * konvansiyon olarak kalırdı — CI'da kırmızı olması gerekiyordu.
 */
export default [
  ...reactInternalConfig,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react-dom", message: "@mari-ui/core headless'tır — react-dom import edemez." },
            { name: "react-native", message: "@mari-ui/core platform-agnostic'tir — react-native import edemez." },
          ],
        },
      ],
    },
  },
  { ignores: ["dist/**"] },
];
