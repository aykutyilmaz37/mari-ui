import { baseConfig } from "@mari-ui/eslint-config";

/**
 * Bu paket JSX/React içermez (madde 12'nin kendi tanımı: "UI'dan bağımsız")
 * — `/react` veya `/native` varyantı değil, temel config yeterli.
 */
export default [...baseConfig, { ignores: ["dist/**"] }];
