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
import { radiusDensities, fontFamily, shadowDensities, motionLevels } from "../src/primitives/scale";
import { personaNames, personas } from "../src/personas";
import { spacingDensities } from "../src/runtimeTheme";
import { colorTokenNames } from "../src/colorTokens";

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
        description: "Birincil marka rengi (anchor tonu — kullanıcının 'gördüğü' ton).",
        default: primaryRamp[600],
      },
      accent: {
        type: "color",
        description:
          "İkincil vurgu rengi (anchor tonu, örn. 500). Kontrastı otomatik hesaplanır — " +
          "kullanıcı bu rengi farklı bir tona çevirse bile solid/subtle metin renkleri " +
          "WCAG AA'yı geçecek şekilde yeniden hesaplanır.",
        default: accentRamp[600],
      },
      tokens: {
        type: "record",
        description:
          "Herhangi bir `--mari-color-*` token'ını birebir ezer (önek olmadan, örn. `surface`, `neutral-solid`, `chart-1`). " +
          "Açık temaya ve `:root`a uygulanır. Türetilmiş değerin yerine geçer — o token için kontrast garantisi kalkar.",
        keys: [...colorTokenNames],
        default: {},
      },
      darkTokens: {
        type: "record",
        description: "`tokens` ile aynı, koyu tema (`[data-theme=\"dark\"]`) için.",
        keys: [...colorTokenNames],
        default: {},
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
      fontFamilyHeading: {
        type: "string",
        description: "Başlık ve marka font ailesi.",
        default: fontFamily.heading,
      },
    },
    density: {
      radius: {
        type: "select",
        description: "Köşe yuvarlaklığı preset'i — tüm radius skalasını orantılı ölçekler (none = keskin).",
        options: [...radiusDensities],
        default: "md",
      },
      spacing: {
        type: "select",
        description:
          "Uygulamanın varsayılan boşluk yoğunluğu (`--spacing` tabanı: Sıkı 0.2rem / Normal 0.25rem / Rahat 0.3rem; yazı boyutu değişmez). " +
          "Son kullanıcı ThemeCustomizer ile kendi tercihini seçebilir; bu yalnız hiç seçim yokken geçerli.",
        options: [...spacingDensities],
        default: "normal",
      },
      shadow: {
        type: "select",
        description: "Faz 21 — gölge yoğunluğu: katman geometrisi aynı, opaklık ölçeklenir (none = gölgesiz, soft = yarı, strong = iki kat).",
        options: [...shadowDensities],
        default: "normal",
      },
    },
    motion: {
      type: "select",
      description: "Faz 21 — hareket seviyesi: tüm geçiş süreleri çarpılır (off = 0, calm = 1.4, normal = 1, lively = 0.85 + hafif taşan eğri). İşletim sisteminin \"hareketi azalt\" tercihi her zaman geçerli.",
      options: [...motionLevels],
      default: "normal",
    },
    persona: {
      type: "select",
      description: "Faz 21 — tasarım kişiliği: renk + font + radius + boşluk + gölge + hareket paketi. Taban olur; bu dosyada açıkça yazılan her alan onu ezer.",
      options: [...personaNames],
      labels: Object.fromEntries(personaNames.map((name) => [name, personas[name].label])),
      default: null,
    },
    scale: {
      fluid: {
        type: "boolean",
        description:
          "Büyük ekran ölçeği: açıkken kök yazı boyutu 1920px'ten itibaren ekran genişliğiyle büyür, 3840px'te (4K) `max`a ulaşır. " +
          "Her şey rem tabanlı olduğu için tüm arayüz orantılı büyür; 1920px ve altı etkilenmez.",
        default: false,
      },
      max: {
        type: "number",
        description: "4K'de (3840px) ulaşılacak kök yazı boyutu (px, 16–32).",
        min: 16,
        max: 32,
        default: 22,
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
