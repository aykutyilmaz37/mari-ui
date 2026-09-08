/**
 * Tema stüdyosunun (Faz 6, `apps/studio`) okuyup yazacağı `dist/schema.json`
 * sözleşmesini üretir. Şema, hangi token'ların kullanıcı tarafından
 * DÜZENLENEBİLİR (renk anchor'ları, font ailesi, radius yoğunluğu) hangilerinin
 * TÜRETİLMİŞ/SABİT (solid/subtle/contrast hesaplamaları, spacing skalası)
 * olduğunu ayırt eder — stüdyo sadece anchor'ları göstermeli, türetilmiş
 * değerleri kullanıcı elle bozamamalı (aksi halde kontrast garantisi çöker).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { accentRamp, primaryRamp } from "../src/primitives/ramps";
import { radius, fontFamily } from "../src/primitives/scale";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../dist/schema.json");

const schema = {
  $schema: "https://mari-ui.dev/schema/theme.schema.json",
  version: 1,
  description:
    "mari-ui.config.json için sözleşme. `editable` alanları tema stüdyosunda kullanıcıya gösterilir; " +
    "diğer her şey (solid/subtle/contrast, spacing, zIndex, ...) build sırasında otomatik türetilir.",
  editable: {
    color: {
      primary: {
        type: "color",
        description: "Birincil marka rengi (anchor tonu, örn. 600).",
        default: primaryRamp[600],
      },
      accent: {
        type: "color",
        description:
          "İkincil vurgu rengi (anchor tonu, örn. 500). Kontrastı otomatik hesaplanır — " +
          "kullanıcı bu rengi turuncudan farklı bir tona çevirse bile solid/subtle metin " +
          "renkleri WCAG AA'yı geçecek şekilde yeniden hesaplanır.",
        default: accentRamp[500],
      },
    },
    typography: {
      fontFamilySans: {
        type: "font",
        description: "Gövde ve UI metni için font ailesi.",
        default: fontFamily.sans,
      },
      fontFamilyMono: {
        type: "font",
        description: "Kod/monospace metin için font ailesi.",
        default: fontFamily.mono,
      },
    },
    density: {
      radius: {
        type: "select",
        description: "Bileşenlerin köşe yuvarlaklığı yoğunluğu.",
        options: Object.keys(radius),
        default: "md",
      },
    },
    themes: {
      type: "record",
      description:
        "Faz 10 — light/dark'ın ÖTESİNDE, keyfi sayıda ek isimli tema (örn. \"brand\", \"highContrast\"). " +
        "Her girdi kendi `base`ini (\"light\" veya \"dark\" — WCAG kontrast aramasının hangi yönde çalışacağı) " +
        "ve isteğe bağlı kendi `color`/`typography` override'larını taşır. Varsayılan: boş (hiç ek tema yok).",
      itemShape: {
        base: { type: "select", options: ["light", "dark"], required: true },
        color: { type: "object", description: "Üstteki `editable.color` ile AYNI şekil, bu temaya özel." },
        typography: { type: "object", description: "Üstteki `editable.typography` ile AYNI şekil, bu temaya özel." },
      },
      default: {},
    },
  },
  derived: {
    description:
      "Bu alanlar `editable` girdilerinden build sırasında otomatik hesaplanır; " +
      "stüdyo arayüzünde düzenlenemez, sadece önizlenir.",
    fields: [
      "color.*.solid",
      "color.*.solidContrast",
      "color.*.solidHover",
      "color.*.subtle",
      "color.*.subtleContrast",
      "color.*.text",
      "color.*.border",
      "spacing.*",
      "shadow.*",
      "zIndex.*",
      "duration.*",
      "easing.*",
      "breakpoint.*",
    ],
  },
} as const;

async function main() {
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(schema, null, 2) + "\n", "utf8");
  console.log(`[@mari-ui/tokens] dist/schema.json üretildi.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
