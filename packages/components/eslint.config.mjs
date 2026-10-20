import { reactInternalConfig } from "@mari-ui/eslint-config/react";
import { treeShakingConfig } from "@mari-ui/eslint-config/tree-shaking";

export default [
  ...reactInternalConfig,
  ...treeShakingConfig,
  { ignores: ["dist/**"] },
];
