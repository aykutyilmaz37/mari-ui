// Faz 4c: entry içi tree-shaking disiplini (bkz. rules/pure-module-scope.mjs).
// Yalnız yayınlanan kaynağa (`src/`) uygulanır; story/test/tip dosyaları tüketiciye gitmez.
import pureModuleScope from "./rules/pure-module-scope.mjs";

/** @type {import('eslint').Linter.Config[]} */
export const treeShakingConfig = [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "mari-ui-tree-shaking": { rules: { "pure-module-scope": pureModuleScope } } },
    rules: { "mari-ui-tree-shaking/pure-module-scope": "error" },
  },
  {
    files: ["**/*.stories.tsx", "**/*.d.ts", "**/types.ts", "**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "**/stories/**"],
    rules: { "mari-ui-tree-shaking/pure-module-scope": "off" },
  },
];

export default treeShakingConfig;
