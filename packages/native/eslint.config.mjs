import { reactNativeConfig } from "@mari-ui/eslint-config/native";

export default [...reactNativeConfig, { ignores: ["dist/**"] }];
