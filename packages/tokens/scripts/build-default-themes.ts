/**
 * `src/defaultThemes.generated.ts`'i üretir: varsayılan `lightTheme`/`darkTheme`
 * nesnelerinin DÜZ VERİ hâli (bundle performansı Faz 4a). Native'de her bileşen,
 * `<ThemeProvider>` yokken bu iki temaya düşer; çalışma zamanında `buildTheme`
 * ile kurulsalardı renk türetme zinciri (deriveColorRole, kontrast, ramp) her
 * native entry'ye ~3 KB min+gz binerdi — veri hâli bunun yarısı.
 *
 * Kaynak değişince: `pnpm --filter @mari-ui/tokens generate:default-themes`.
 * Unutulursa `resolveThemeConfig.test.ts`'teki "boş config = lightTheme/darkTheme"
 * regresyon testi kırılır (orada temalar `buildTheme` ile taze kurulur).
 */
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveThemeConfig } from "../src/theme";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../src/defaultThemes.generated.ts");

/** JSON'dan farkı: `undefined` alanlar (ör. `colorOverrides`) de yazılır — nesne şekli birebir kalsın. */
function literal(value: unknown, indent = ""): string {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  const inner = `${indent}  `;
  if (Array.isArray(value)) return `[${value.map((v) => literal(v, inner)).join(", ")}]`;
  const entries = Object.entries(value).map(([k, v]) => `${inner}${/^[a-z_$][\w$]*$/i.test(k) ? k : JSON.stringify(k)}: ${literal(v, inner)},`);
  return `{\n${entries.join("\n")}\n${indent}}`;
}

const { light, dark } = resolveThemeConfig({});
const source = `// ÜRETİLMİŞ DOSYA — elle düzenlemeyin: \`pnpm --filter @mari-ui/tokens generate:default-themes\`
// (scripts/build-default-themes.ts). \`buildTheme("light" | "dark")\` çıktısının düz veri hâli.
import type { Theme } from "./theme";

export const lightTheme: Theme = ${literal(light)};

export const darkTheme: Theme = ${literal(dark)};
`;

await writeFile(OUT_FILE, source);
console.log(`[@mari-ui/tokens] ${OUT_FILE} üretildi.`);
