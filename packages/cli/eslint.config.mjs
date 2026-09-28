import { baseConfig } from "@mari-ui/eslint-config";

/**
 * Bu paket saf Node.js CLI'ı — React/JSX yok, dolayısıyla `/react` veya
 * `/native` varyantı değil, temel config yeterli.
 */
export default [...baseConfig, { ignores: ["dist/**"] }];
