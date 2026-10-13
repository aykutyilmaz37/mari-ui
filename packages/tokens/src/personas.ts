import type { MariUiThemeConfig } from "./theme";

/**
 * Faz 21 — tasarım kişilikleri. "Projeler birbirinin kopyası olmasın" kararının
 * kütüphane tarafı: renk + font eşleşmesi + radius + boşluk + gölge + hareket
 * birlikte seçilmiş hazır kombinasyonlar. Yeni bir token ekseni YOK — her kişilik
 * yalnızca `mari-ui.config.json`ın zaten anladığı alanların bir paketi; config'te
 * açıkça yazılan her alan kişiliği ezer (`applyPersona`).
 *
 * Fontlar yalnız aile adıdır; yüklemek tüketicinin işi (web: `googleFonts`
 * listesinden `<link>`, native: `expo-font`). Yüklenmemişse yığındaki sistem
 * fontuna düşer — bozulmaz, yalnız kişilik zayıflar.
 *
 * Türkçe: her aile ğ Ğ ı İ ş Ş ç Ç ö Ö ü Ü glifleri tarayıcıda ölçülerek seçildi
 * (yalnız `unicode-range`e bakmak yetmez — Fredoka aralığı bildirip ğ/İ/Ş çizmiyordu).
 * Yeni font eklerken aynı ölçümü yapın.
 */
export const personaNames = ["corporate", "playful", "minimal", "editorial", "luxury"] as const;
export type PersonaName = (typeof personaNames)[number];

export interface Persona {
  name: PersonaName;
  /** Arayüzde gösterilen Türkçe ad. */
  label: string;
  /** Kime/neye uygun — AI kuralları ve CLI bu metni kullanıcıya gösterir. */
  description: string;
  /** Google Fonts `family` parametreleri (css2 API), ör. `"Inter:wght@400;500;600;700"`. */
  googleFonts: string[];
  config: Omit<MariUiThemeConfig, "persona" | "themes" | "scale">;
}

const SANS_FALLBACK = "ui-sans-serif, system-ui, -apple-system, sans-serif";
const SERIF_FALLBACK = 'ui-serif, Georgia, "Times New Roman", serif';
const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
const MONO_FONT = "JetBrains Mono:wght@400;500";

export const personas: Record<PersonaName, Persona> = {
  corporate: {
    name: "corporate",
    label: "Kurumsal",
    description: "Güven veren, yoğun bilgi taşıyan arayüzler: yönetim panelleri, finans, B2B, kamu. Lacivert, sakin, sıkı.",
    googleFonts: ["IBM Plex Sans:wght@400;500;600;700", MONO_FONT],
    config: {
      color: { primary: "#1e40af", accent: "#0f766e" },
      typography: { fontFamilySans: `"IBM Plex Sans", ${SANS_FALLBACK}`, fontFamilyHeading: `"IBM Plex Sans", ${SANS_FALLBACK}`, fontFamilyMono: MONO },
      density: { radius: "sm", spacing: "compact", shadow: "soft" },
      motion: "calm",
    },
  },
  playful: {
    name: "playful",
    label: "Oyunbaz",
    description: "Enerjik, samimi ürünler: tüketici uygulamaları, eğitim, çocuk, oyun, topluluk. Canlı pembe + camgöbeği, yuvarlak hatlar, sıçrayan hareket.",
    googleFonts: ["Nunito:wght@400;600;700;800", "Baloo 2:wght@500;600;700", MONO_FONT],
    config: {
      color: { primary: "#db2777", accent: "#0891b2" },
      typography: { fontFamilySans: `"Nunito", ${SANS_FALLBACK}`, fontFamilyHeading: `"Baloo 2", "Nunito", ${SANS_FALLBACK}`, fontFamilyMono: MONO },
      density: { radius: "lg", spacing: "comfortable", shadow: "strong" },
      motion: "lively",
    },
  },
  minimal: {
    name: "minimal",
    label: "Minimal",
    description: "İçeriği öne çıkaran sade arayüzler: geliştirici araçları, portfolyo, verimlilik. Nötr tonlar, keskin köşe, gölge yok, bol boşluk.",
    googleFonts: ["Inter:wght@400;500;600;700", MONO_FONT],
    config: {
      color: { primary: "#334155", accent: "#2563eb" },
      typography: { fontFamilySans: `"Inter", ${SANS_FALLBACK}`, fontFamilyHeading: `"Inter", ${SANS_FALLBACK}`, fontFamilyMono: MONO },
      density: { radius: "none", spacing: "comfortable", shadow: "none" },
      motion: "calm",
    },
  },
  editorial: {
    name: "editorial",
    label: "Editoryal",
    description: "Okuma odaklı siteler: haber, blog, dergi, içerik platformları. Serif başlık, mürekkep tonları, belirgin vurgu rengi.",
    googleFonts: ["Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700", "Source Sans 3:wght@400;500;600;700", MONO_FONT],
    config: {
      color: { primary: "#b91c1c", accent: "#1f2937" },
      typography: { fontFamilySans: `"Source Sans 3", ${SANS_FALLBACK}`, fontFamilyHeading: `"Fraunces", ${SERIF_FALLBACK}`, fontFamilyMono: MONO },
      density: { radius: "sm", spacing: "normal", shadow: "none" },
      motion: "normal",
    },
  },
  luxury: {
    name: "luxury",
    label: "Lüks",
    description: "Prestijli markalar: moda, mücevher, otel, gayrimenkul, premium hizmet. Zarif serif, altın/koyu tonlar, keskin köşe, yavaş hareket.",
    googleFonts: ["Cormorant Garamond:wght@500;600;700", "Jost:wght@400;500;600", MONO_FONT],
    config: {
      color: { primary: "#a16207", accent: "#292524" },
      typography: { fontFamilySans: `"Jost", ${SANS_FALLBACK}`, fontFamilyHeading: `"Cormorant Garamond", ${SERIF_FALLBACK}`, fontFamilyMono: MONO },
      density: { radius: "none", spacing: "comfortable", shadow: "soft" },
      motion: "calm",
    },
  },
};

/** Kişilik yoksa config aynen döner; varsa kişilik taban olur, config'teki her alan onu ezer. */
export function applyPersona(config: MariUiThemeConfig): MariUiThemeConfig {
  if (!config.persona) return config;
  const base = personas[config.persona]?.config;
  if (!base) return config;
  return {
    ...base,
    ...config,
    color: { ...base.color, ...config.color },
    typography: { ...base.typography, ...config.typography },
    density: { ...base.density, ...config.density },
    motion: config.motion ?? base.motion,
  };
}

/** Kişiliğin fontları için Google Fonts css2 adresi (web `<link rel="stylesheet">`). */
export function personaFontsUrl(name: PersonaName): string {
  const families = personas[name].googleFonts.map((family) => `family=${family.replace(/ /g, "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

type ConfigGroup = "color" | "typography" | "density";

/**
 * Kişilikli bir config'ten kişiliğin zaten verdiği değerleri çıkarır — geriye yalnız
 * `persona` + gerçekten farklı alanlar kalır (stüdyo dışa aktarımı, CLI). Kişiliğin
 * vermediği alan varsayılanla karşılaştırılır. Kişilik yoksa config aynen döner.
 */
export function minimizeConfig(config: MariUiThemeConfig, defaults: MariUiThemeConfig): MariUiThemeConfig {
  if (!config.persona) return config;
  const p = personas[config.persona].config;
  const base: MariUiThemeConfig = {
    color: { ...defaults.color, ...p.color },
    typography: { ...defaults.typography, ...p.typography },
    density: { ...defaults.density, ...p.density },
    motion: p.motion ?? defaults.motion,
  };
  const out: MariUiThemeConfig = { persona: config.persona };
  for (const group of ["color", "typography", "density"] as ConfigGroup[]) {
    const changed = Object.entries(config[group] ?? {}).filter(([key, value]) => value !== undefined && (base[group] as Record<string, unknown> | undefined)?.[key] !== value);
    if (changed.length) (out as Record<string, unknown>)[group] = Object.fromEntries(changed);
  }
  if (config.motion && config.motion !== base.motion) out.motion = config.motion;
  if (config.scale) out.scale = config.scale;
  if (config.themes) out.themes = config.themes;
  return out;
}
