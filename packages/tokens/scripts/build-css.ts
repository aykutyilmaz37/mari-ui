/**
 * `theme.ts`'teki tek kaynaktan CSS çıktıları üretir. Elle yazılmaz —
 * çünkü elle yazılan bir CSS token dosyası, mevcut `globals.css`'te olduğu
 * gibi (`--text-base: "#000000"` tırnaklı string hatası, `.dark` bloğunda
 * `:root` ile birebir aynı 16 satır) kaynaktan kopar ve sessizce bozulur.
 *
 * Asıl CSS bloğu inşa mantığı `../src/cssOutput.ts`te — bu dosya sadece
 * paketin KENDİ varsayılan temasını (`lightTheme`/`darkTheme`) o fonksiyonlara
 * geçirip `dist/`e yazan ince bir sarmalayıcı. `@mari-ui/cli`ın `theme`
 * komutu (Faz 7) AYNI `cssOutput.ts` fonksiyonlarını bir TÜKETİCİNİN özel
 * teması için çağırır — mantık iki yerde yok.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { darkTheme, lightTheme } from "../src/theme";
import { buildPlainThemeCss, buildTailwindThemeCss } from "../src/cssOutput";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, "../dist");

async function main() {
  const plainCss = buildPlainThemeCss(lightTheme, darkTheme);
  const tailwindCss = buildTailwindThemeCss(lightTheme);

  await mkdir(DIST_DIR, { recursive: true });
  await writeFile(resolve(DIST_DIR, "theme.css"), plainCss, "utf8");
  await writeFile(resolve(DIST_DIR, "tailwind-theme.css"), tailwindCss, "utf8");
  console.log(
    `[@mari-ui/tokens] dist/theme.css (${plainCss.length} bayt) ve dist/tailwind-theme.css (${tailwindCss.length} bayt) üretildi.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
