import { cancel, isCancel, select, text } from "@clack/prompts";
import { defaultThemeConfig, personaNames, personas, radiusDensities, spacingDensities, type HexColor, type MariUiThemeConfig, type RadiusDensity, type SpacingDensity } from "@mari-ui/tokens";
import { DEFAULT_THEME_DESCRIPTION, DEFAULT_THEME_LABEL, describeConfig, isHexColor, type ThemeChoice } from "./themeChoice";

const RADIUS_LABELS: Record<RadiusDensity, string> = { none: "Keskin", sm: "Az yuvarlak", md: "Orta", lg: "Çok yuvarlak" };
const SPACING_LABELS: Record<SpacingDensity, string> = { compact: "Sıkı", normal: "Normal", comfortable: "Rahat" };

/** Sihirbaz iptal edildi (Ctrl+C / Esc) — hiçbir dosyaya dokunulmaz. */
export class WizardCancelled extends Error {}

function orCancel<T>(value: T): Exclude<T, symbol> {
  if (isCancel(value)) {
    cancel("İptal edildi — hiçbir dosya değişmedi.");
    throw new WizardCancelled();
  }
  return value as Exclude<T, symbol>;
}

/**
 * Etkileşimli tema seçimi. `current` varsa ilk seçenek onu korur (`null` döner →
 * config'e dokunulmaz). Yalnız TTY'de çağrılır; CI'da bayraklar ya da mevcut config kullanılır.
 */
export async function askThemeChoice(current: MariUiThemeConfig | undefined): Promise<ThemeChoice | null> {
  const KEEP = "__keep__";
  const options = [
    ...(current ? [{ value: KEEP, label: `Mevcut ayarı koru — ${describeConfig(current)}` }] : []),
    { value: "default", label: DEFAULT_THEME_LABEL, hint: DEFAULT_THEME_DESCRIPTION },
    ...personaNames.map((name) => ({ value: name as string, label: personas[name].label, hint: personas[name].description })),
    { value: "custom", label: "Özel", hint: "Kendi marka renklerim; köşe ve yoğunluğu ben seçeyim." },
  ];
  const picked = orCancel(await select({ message: "Hangi temayı kuralım?", options, initialValue: current ? KEEP : "default" }));

  if (picked === KEEP) return null;
  if (picked === "default") return { kind: "default" };
  if (picked !== "custom") return { kind: "persona", name: picked as (typeof personaNames)[number] };
  return askCustom();
}

async function askCustom(): Promise<ThemeChoice> {
  const primary = orCancel(
    await text({
      message: "Birincil (marka) renk",
      placeholder: "#0f766e",
      validate: (v) => (v && isHexColor(v) ? undefined : "6 haneli hex renk girin, örnek: #0f766e"),
    })
  );
  const accent = orCancel(
    await text({
      message: "Vurgu rengi (boş bırakılırsa varsayılan)",
      placeholder: defaultThemeConfig.color.accent,
      validate: (v) => (!v || isHexColor(v) ? undefined : "6 haneli hex renk girin ya da boş bırakın"),
    })
  );
  const radius = orCancel(
    await select({
      message: "Köşe yuvarlaklığı",
      options: radiusDensities.map((value) => ({ value, label: RADIUS_LABELS[value] })),
      initialValue: defaultThemeConfig.density.radius,
    })
  );
  const spacing = orCancel(
    await select({
      message: "Yoğunluk",
      options: spacingDensities.map((value) => ({ value, label: SPACING_LABELS[value] })),
      initialValue: defaultThemeConfig.density.spacing,
    })
  );
  return { kind: "custom", primary: primary as HexColor, accent: accent ? (accent as HexColor) : undefined, radius, spacing };
}
