/* eslint-disable mari-ui/require-use-client-with-hooks -- Node'da koşan test-runner config'i, bileşen değil; `document` yalnız page.evaluate içinde (tarayıcıda) kullanılıyor. */
import { getStoryContext, waitForPageReady, type TestRunnerConfig } from "@storybook/test-runner";
import { checkA11y, configureAxe, injectAxe } from "axe-playwright";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "playwright";

/**
 * `pnpm test-storybook`: her story (web + native) Playwright'ta açılır —
 * çizim hatası ya da `play` hatası testi kırar — ve ardından axe taraması
 * yapılır (Storybook a11y eklentisinin motoru, aynı kurallar). Bir story
 * `parameters.a11y.disable` ile atlanabilir, `parameters.a11y.config.rules`
 * ile kural ayarlanabilir; ikisi de gerekçesiyle yazılmalı.
 *
 * Görsel regresyon (`VISUAL=1`): her story'nin ekran görüntüsü
 * `apps/docs/__visual__/` altındaki referansla karşılaştırılır; fark eşiği
 * aşılırsa test kırılır, fark görüntüsü `__visual__/__diff_output__/`a yazılır.
 * Referanslar YALNIZ CI'ın Playwright Docker imajında üretilir (font/render
 * Mac'ten farklı) — bkz. CONTRIBUTING.md "Görsel regresyon". Kararsız bir story
 * (ağdan medya, animasyon, saat) `tags: ["no-visual"]` ile gerekçesiyle hariç
 * tutulur (`parameters` değil: `storyDoc` onu zaten dolduruyor; tag'ler birleşir).
 */
const VISUAL = process.env.VISUAL === "1";
const SNAPSHOT_DIR = path.join(process.cwd(), "__visual__");
// Story'lerin örnek medyası (picsum, pravatar, MDN videosu) her koşuda farklı/geç gelir ve
// dış servise bağımlıdır: görsel modda hepsi bu sabit yerel görsele yönlenir, video ve diğer
// dış istekler reddedilir (`invalid.example` gibi bilerek bozuk adresler yine hata verir).
const MEDIA_HOSTS = ["picsum.photos", "i.pravatar.cc", "interactive-examples.mdn.mozilla.net"];
const PLACEHOLDER = readFileSync(path.join(process.cwd(), ".storybook/visual-placeholder.png"));
const routedPages = new WeakSet<Page>();

async function routeExternalMedia(page: Page) {
  if (routedPages.has(page)) return;
  routedPages.add(page);
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => {
    const request = route.request();
    const host = new URL(request.url()).hostname;
    if (request.resourceType() === "image" && MEDIA_HOSTS.includes(host)) {
      return route.fulfill({ status: 200, contentType: "image/png", body: PLACEHOLDER });
    }
    return route.abort();
  });
}

/** Görünür resimler yüklensin (tembel/ekran dışı olanlar için en çok 3 sn). */
async function waitForImages(page: Page) {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        [...document.images].filter((img) => !img.complete).map(
            (img) =>
              new Promise((done) => {
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              })
          )
      ),
      new Promise((done) => setTimeout(done, 3000)),
    ])
  );
}

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async preVisit(page) {
    // Azaltılmış hareket: giriş animasyonları (Toast vb.) anında biter, axe ara karede (saydam) kontrast ölçmez.
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (VISUAL) await routeExternalMedia(page);
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const story = await getStoryContext(page, context);
    // Fontlar ve giriş animasyonları otursun: kontrast/ekran görüntüsü ara karede alınmasın.
    await waitForPageReady(page);

    if (VISUAL && !story.tags.includes("no-visual")) {
      await waitForImages(page);
      const image = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: SNAPSHOT_DIR,
        customSnapshotIdentifier: context.id,
        // Alt-piksel kenar yumuşatma gürültüsünü yut; gerçek bir padding/renk kayması bunu aşar.
        failureThreshold: 0.001,
        failureThresholdType: "percent",
      });
    }

    const a11y = story.parameters?.a11y as { disable?: boolean; config?: { rules?: { id: string; enabled: boolean }[] } } | undefined;
    if (a11y?.disable) return;
    await configureAxe(page, { rules: a11y?.config?.rules });
    // verbose kapalı: temiz story'de satır basmaz, yalnız ihlal raporlanır.
    await checkA11y(page, "#storybook-root", { verbose: false, detailedReport: true, detailedReportOptions: { html: true } });
  },
};

export default config;
