import { run } from "axe-core";

/**
 * Faz 9 (backlog madde 14 — erişilebilirlik disiplini): Faz 4'ün
 * `@storybook/addon-a11y`si sadece Storybook AÇILIP GÖZLE bakıldığında
 * çalışıyordu. Bu yardımcı AYNI axe-core motorunu (Storybook'un addon'ının
 * arkasındaki KÜTÜPHANENİN AYNISI) `pnpm test`e (ve CI'a, bkz. Faz 8) bağlar
 * — regresyonlar sessizce geri gelemez.
 */
const DISABLED_RULES_IN_JSDOM = [
  // `color-contrast` gerçek piksel render'ı gerektirir — jsdom'da ÇALIŞAMAZ
  // (yanlış-pozitif/negatif üretir). Zaten gereksiz: kontrast garantisi
  // @mari-ui/tokens'ta matematiksel olarak (WCAG AA hesabıyla) veriliyor,
  // bkz. Faz 1 — `deriveColorRole`/`contrast.test.ts`.
  "color-contrast",
  // Sayfa DÜZEYİNDE kurallar — tek bir component'i izole test ederken
  // anlamsız (component bir <main>/<h1> taşımak zorunda değil).
  "landmark-one-main",
  "region",
  "page-has-heading-one",
];

export interface A11yCheckOptions {
  /** Ek olarak devre dışı bırakılacak kural ID'leri (nadir, gerekçeli istisnalar için). */
  additionalDisabledRules?: string[];
}

/**
 * Render edilmiş bir component ağacında axe-core çalıştırır, ihlal
 * VARSA okunabilir string'ler (hangi kural, kaç node, dokümantasyon linki),
 * yoksa boş dizi döner. Test tarafında `expect(await getA11yViolations(
 * container)).toEqual([])` şeklinde GERÇEK bir `expect()` ile kullanılır —
 * bilinçli olarak fırlatmıyor (SonarJS'in `assertions-in-tests` kuralı,
 * testin kendi içinde tanınabilir bir assertion GÖRMEK istiyor; bu ayrıca
 * bir hata durumunda vitest'in kendi okunaklı dizi diff'ini de verir).
 */
export async function getA11yViolations(container: Element, options: A11yCheckOptions = {}): Promise<string[]> {
  const disabledRules = [...DISABLED_RULES_IN_JSDOM, ...(options.additionalDisabledRules ?? [])];
  const results = await run(container, {
    rules: Object.fromEntries(disabledRules.map((id) => [id, { enabled: false }])),
  });
  return results.violations.map((v) => `[${v.id}] ${v.help} (${v.nodes.length} node) — ${v.helpUrl}`);
}
