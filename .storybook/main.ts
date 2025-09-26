import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    {
      "name": "@storybook/addon-essentials",
      "options": {
        "docs": false
      }
    },
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {
      "nextConfigPath": "../next.config.ts"
    }
  },
  "staticDirs": [
    "../public"
  ],
  "webpackFinal": async (config) => {
    // Next.js App Router için gerekli konfigürasyon
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '/src',
      };
    }
    return config;
  },
};
export default config;