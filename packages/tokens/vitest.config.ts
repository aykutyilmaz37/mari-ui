import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.stories.{ts,tsx}", "src/**/__tests__/**", "src/**/testUtils/**"],
      reporter: ["text-summary", "json-summary", "html"],
      // Bugünkü oranın ~1 puan altı (kilit): düşerse CI kırılır; test eklendikçe elle yükseltilir.
      thresholds: { lines: 95, statements: 95, branches: 92, functions: 95 },
    },
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
