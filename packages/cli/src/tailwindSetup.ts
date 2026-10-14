/*
 * Host projede Tailwind var mı, hangi sürüm — `init` doğru CSS kurulumunu buna
 * göre söyler (plan §23 madde 2, "Strateji B"):
 */
/**
 * **v4:** host'un kendi Tailwind'i mari-ui sınıflarını da derler —
 *  `@mari-ui/components/tailwind.css` import edilir, derlenmiş `styles.css` EDİLMEZ
 *  (ikisi birlikte aynı sınıfları ve preflight'ı iki kez yükler).
 * - **v3:** desteklenmez — tema dosyalarımız v4 söz dizimi (`@theme`, `@source`,
 *  `@utility`). Derlenmiş `styles.css` çalışır ama host'un v3 sınıflarıyla çakışır;
 *  önerilen yol Tailwind'in resmi yükseltme aracı.
 * - **yok:** derlenmiş `@mari-ui/components/styles.css`.
 */
export type TailwindSetup = "v4" | "v3" | "none";

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** `^4.1.0`, `~3.4.1`, `4`, `latest`… → ana sürüm; çözülemezse `null`. */
function majorOf(range: string): number | null {
  const match = /(\d+)/.exec(range);
  return match ? Number(match[1]) : null;
}

export function detectTailwind(pkg: PackageJsonLike | null): TailwindSetup {
  if (!pkg) return "none";
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  // v4'ün eklenti paketleri yalnız v4'te var.
  if (deps["@tailwindcss/vite"] || deps["@tailwindcss/postcss"] || deps["@tailwindcss/cli"]) return "v4";
  const range = deps.tailwindcss;
  if (!range) return "none";
  const major = majorOf(range);
  if (major === null) return "v4"; // "latest" / workspace → güncel sürüm
  return major >= 4 ? "v4" : "v3";
}

/** `init` çıktısındaki kurulum talimatı. */
export function tailwindInstructions(setup: TailwindSetup): string[] {
  if (setup === "v4") {
    return [
      "Tailwind v4 bulundu — mari-ui sınıflarını kendi Tailwind'iniz derleyecek (tekrar yok). Global CSS dosyanıza:",
      '  @import "tailwindcss";',
      '  @import "@mari-ui/components/tailwind.css";',
      '  @import "../mari-ui-theme.css";  /* npx @mari-ui/cli theme proje köküne yazar; yol bu CSS dosyasına göre (örnek: src/index.css) */',
      '⚠ "@mari-ui/components/styles.css"i AYRICA import etmeyin: aynı sınıfları ve sıfırlamayı ikinci kez yükler.',
    ];
  }
  if (setup === "v3") {
    return [
      "⚠ Tailwind v3 bulundu — desteklenmiyor (mari-ui teması v4 söz dizimiyle yazılı).",
      "  Önerilen: npx @tailwindcss/upgrade  (projeyi v4'e taşır), sonra npx @mari-ui/cli init'i tekrar çalıştırın.",
      '  Geçici çözüm: "@mari-ui/components/styles.css" çalışır ama v3 sınıflarınızla çakışabilir.',
    ];
  }
  return [
    "Tailwind bulunamadı — hazır derlenmiş CSS'i global CSS dosyanıza import edin:",
    '  @import "@mari-ui/components/styles.css";',
    '  @import "../mari-ui-theme.css";  /* npx @mari-ui/cli theme proje köküne yazar; yol bu CSS dosyasına göre (örnek: src/index.css) */',
  ];
}
