import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.stories.{ts,tsx}", "src/**/__tests__/**", "src/**/testUtils/**"],
      reporter: ["text-summary", "json-summary", "html"],
      // Bugünkü oranın ~1 puan altı (kilit): düşerse CI kırılır; test eklendikçe elle yükseltilir.
      // Satır oranı düşük: unit testler saf yardımcıları kapsar; component çizimini Storybook test-runner (web üstünden) kapsar.
      thresholds: { lines: 14, statements: 14, branches: 82, functions: 61 },
    },
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
  },
});
