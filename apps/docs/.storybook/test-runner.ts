import { getStoryContext, waitForPageReady, type TestRunnerConfig } from "@storybook/test-runner";
import { checkA11y, configureAxe, injectAxe } from "axe-playwright";

/**
 * `pnpm test-storybook`: her story (web + native) Playwright'ta açılır —
 * çizim hatası ya da `play` hatası testi kırar — ve ardından axe taraması
 * yapılır (Storybook a11y eklentisinin motoru, aynı kurallar). Bir story
 * `parameters.a11y.disable` ile atlanabilir, `parameters.a11y.config.rules`
 * ile kural ayarlanabilir; ikisi de gerekçesiyle yazılmalı.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    // Azaltılmış hareket: giriş animasyonları (Toast vb.) anında biter, axe ara karede (saydam) kontrast ölçmez.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const story = await getStoryContext(page, context);
    const a11y = story.parameters?.a11y as { disable?: boolean; config?: { rules?: { id: string; enabled: boolean }[] } } | undefined;
    if (a11y?.disable) return;
    // Fontlar ve giriş animasyonları otursun: kontrast ara karede ölçülmesin.
    await waitForPageReady(page);
    await configureAxe(page, { rules: a11y?.config?.rules });
    // verbose kapalı: temiz story'de satır basmaz, yalnız ihlal raporlanır.
    await checkA11y(page, "#storybook-root", { verbose: false, detailedReport: true, detailedReportOptions: { html: true } });
  },
};

export default config;
