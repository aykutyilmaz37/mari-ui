import { reactInternalConfig } from "@mari-ui/eslint-config/react";

export default [
  ...reactInternalConfig,
  { ignores: ["dist/**"] },
];
