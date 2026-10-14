import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.stories.{ts,tsx}", "src/**/__tests__/**", "src/**/testUtils/**"],
      reporter: ["text-summary", "json-summary", "html"],
      // Bugünkü oranın ~1 puan altı (kilit, vitest 4'ün AST tabanlı v8 ölçümüyle): düşerse CI kırılır; test eklendikçe elle yükseltilir.
      thresholds: { lines: 88, statements: 86, branches: 81, functions: 84 },
    },
    environment: "jsdom",
    // jsdom + axe + coverage CI runner'ında yerelden ~8 kat yavaş (axe testleri 5 sn'yi aşıyordu).
    testTimeout: 15_000,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
  },
});
