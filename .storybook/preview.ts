import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Next.js App Router için gerekli parametreler
    nextjs: {
      appDirectory: true,
    },
  },
  // App Router için basit decorator
  decorators: [
    (Story) => {
      return Story();
    },
  ],
};

export default preview;
