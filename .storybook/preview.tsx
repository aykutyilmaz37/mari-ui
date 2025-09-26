import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";
import { Suspense } from "react";

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
  // App Router için decorator
  decorators: [
    (Story) => (
      <Suspense fallback={<div>Loading...</div>}>
        <Story />
      </Suspense>
    ),
  ],
};

export default preview;
