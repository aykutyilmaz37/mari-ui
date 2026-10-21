import {
  defaultThemeConfig,
  personaNames,
  personas,
  type HexColor,
  type MariUiThemeConfig,
  type PersonaName,
  type RadiusDensity,
  type SpacingDensity,
} from "@mari-ui/tokens";

/**
 * Tema seçimi: varsayılan (Yumuşak iris), hazır bir tasarım kişiliği ya da
 * kendi renkleriyle özel tema. `theme` / `init` sihirbazı ve bayraklar
 * (`--persona`, `--primary`) aynı seçime çözülür, config'i bu modül yazar.
 */
export type ThemeChoice =
  | { kind: "default" }
  | { kind: "persona"; name: PersonaName }
  | { kind: "custom"; primary: HexColor; accent?: HexColor; radius?: RadiusDensity; spacing?: SpacingDensity };

export const DEFAULT_THEME_LABEL = "Varsayılan (Yumuşak iris)";
export const DEFAULT_THEME_DESCRIPTION = "mari-ui'ın kendi teması: iris moru, yumuşak köşeler, Geist font. Her türlü ürün için güvenli başlangıç.";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** `#6951ce` biçiminde 6 haneli hex mi? (Kısa `#abc` ve isimli renkler kabul edilmez — rampa üretimi tam değer ister.) */
export function isHexColor(value: string): value is HexColor {
  return HEX.test(value.trim());
}

/**
 * Seçimi `mari-ui.config.json`a çevirir. Tema dışı alanlar (`themes` — ek
 * temalar, `scale` — büyük ekran, `platform`) mevcut config'ten korunur; tema alanları
 * (kişilik, renk, font, yoğunluk, hareket) seçime göre baştan yazılır.
 */
export function configFromChoice(choice: ThemeChoice, current: MariUiThemeConfig = {}): MariUiThemeConfig {
  const kept: MariUiThemeConfig = {};
  if (current.scale) kept.scale = current.scale;
  if (current.themes) kept.themes = current.themes;
  if (current.platform) kept.platform = current.platform;
  // Elle ezilen token'lar (`color.tokens`/`darkTokens`) sihirbaz seçiminden bağımsız ince ayardır; korunur.
  const { tokens, darkTokens } = current.color ?? {};
  const keptColor = { ...(tokens && { tokens }), ...(darkTokens && { darkTokens }) };

  if (choice.kind === "persona") return { persona: choice.name, ...(tokens || darkTokens ? { color: keptColor } : {}), ...kept };
  if (choice.kind === "default") {
    const { color, typography, density, motion } = defaultThemeConfig;
    return { color: { ...color, ...keptColor }, typography, density, motion, ...kept };
  }
  return {
    color: { primary: normalizeHex(choice.primary), accent: normalizeHex(choice.accent ?? defaultThemeConfig.color.accent), ...keptColor },
    density: { ...defaultThemeConfig.density, radius: choice.radius ?? defaultThemeConfig.density.radius, spacing: choice.spacing ?? defaultThemeConfig.density.spacing },
    ...kept,
  };
}

function normalizeHex(value: string): HexColor {
  return value.trim().toLowerCase() as HexColor;
}

/** Mevcut config'in kısa adı ("Minimal", "Özel (#0f766e)", "Varsayılan (Yumuşak iris)") — sihirbazdaki "mevcut ayarı koru" seçeneği için. */
export function describeConfig(config: MariUiThemeConfig): string {
  if (config.persona) return personas[config.persona].label;
  const primary = config.color?.primary;
  if (primary && primary.toLowerCase() !== defaultThemeConfig.color.primary.toLowerCase()) return `Özel (${primary})`;
  return DEFAULT_THEME_LABEL;
}

/** `--persona` değeri: kişilik adı ya da `default`. Tanınmazsa `undefined`. */
export function parsePersonaFlag(value: string | undefined): PersonaName | "default" | undefined {
  if (value === "default") return "default";
  if (value && (personaNames as readonly string[]).includes(value)) return value as PersonaName;
  return undefined;
}

/**
 * Bayraklardan seçim (sihirbazsız kullanım, CI). `--primary` verildiyse özel
 * tema; yoksa `--persona`. İkisi de yoksa `undefined` (sihirbaz ya da mevcut config).
 */
export function choiceFromFlags(flags: { persona?: PersonaName | "default"; primary?: string; accent?: string }): ThemeChoice | undefined {
  if (flags.primary !== undefined) {
    if (!isHexColor(flags.primary)) throw new Error(`--primary geçerli bir hex renk değil: ${flags.primary} (örnek: #0f766e)`);
    if (flags.accent !== undefined && !isHexColor(flags.accent)) throw new Error(`--accent geçerli bir hex renk değil: ${flags.accent}`);
    return { kind: "custom", primary: flags.primary, accent: flags.accent as HexColor | undefined };
  }
  if (flags.persona === "default") return { kind: "default" };
  if (flags.persona) return { kind: "persona", name: flags.persona };
  return undefined;
}
