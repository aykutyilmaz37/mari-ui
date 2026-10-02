import type { HexColor } from "./contrast";
import { AA_LARGE_OR_UI_MIN, meetsAA } from "./contrast";
import { themeToCssVariables } from "./cssVariables";
import { generateRamp } from "./primitives/generateRamp";
import type { ColorRamp } from "./primitives/ramps";
import { deriveColorRole, type ColorShade, type SemanticColorRole, type ThemeMode } from "./semantic/deriveColorRole";
import { darkTheme, lightTheme } from "./theme";

/**
 * Faz 16.8 — son kullanıcı tema ayarları (ThemeCustomizer). `mari-ui.config.json`
 * (geliştiricinin derleme zamanı teması) ile KARIŞTIRILMAMALI: burada yalnızca
 * çalışma zamanında, kullanıcının kendi seçtiği üç eksen var — mod, vurgu rengi
 * (`primary` rampası) ve boşluk yoğunluğu. Config'teki `density` alanı bugün
 * radius demek; ad çakışmasın diye bu eksenin adı `spacing`.
 */
export type ColorSchemePreference = "light" | "dark" | "system";

export const spacingDensities = ["compact", "normal", "comfortable"] as const;
export type SpacingDensity = (typeof spacingDensities)[number];

/**
 * Tailwind v4 `--spacing` taban birimi. Derlenmiş utility'ler `calc(var(--spacing) * n)`
 * olduğu için bu tek değer tüm yükseklik/iç boşluk/aralıkları orantılı ölçekler;
 * yazı boyutu değişmez. `@mari-ui/components/styles.css`teki `[data-density]`
 * kuralları BU değerlerle birebir aynı tutulmalı.
 */
export const spacingDensityBase: Record<SpacingDensity, string> = {
  compact: "0.2rem",
  normal: "0.25rem",
  comfortable: "0.3rem",
};

export interface ThemeSettings {
  mode: ColorSchemePreference;
  /** Kullanıcının seçtiği vurgu rengi; yoksa paketin varsayılan `primary` rampası. */
  primary?: HexColor;
  spacing: SpacingDensity;
}

export const defaultThemeSettings: ThemeSettings = { mode: "system", spacing: "normal" };

const shadeOrder: ColorShade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/** `buildSemanticColors`teki primary tercihleriyle aynı. */
const PREFERRED_PRIMARY_SHADE: Record<ThemeMode, ColorShade> = { light: 600, dark: 400 };

/**
 * Otomatik kontrast düzeltmesi (kullanıcı kararı: "uyarma, düzelt"). Dolgu
 * üstü metin zaten `deriveColorRole`de her renkte AA'yı geçiyor (beyaz / koyu
 * mürekkep / siyah arasından seçilir); eksik kalan, dolgunun KENDİSİNİN sayfa
 * zeminine karşı görünürlüğü (WCAG 1.4.11, ≥3:1) — açık sarı/yeşil/camgöbeği
 * bir düğme beyaz zeminde kayboluyordu. Tercih edilen tondan başlayıp zeminden
 * uzaklaşan yönde (açık temada koyuya, koyu temada açığa) ilk geçen ton seçilir;
 * renk ancak gerektiği kadar kayar.
 *
 * Paketin kendi temasına uygulanmaz: `warning` dolgusu bilinçli olarak sarı.
 */
export function accessibleSolidShade(ramp: ColorRamp, mode: ThemeMode, backgrounds: readonly HexColor[], preferred: ColorShade = PREFERRED_PRIMARY_SHADE[mode]): ColorShade {
  const start = shadeOrder.indexOf(preferred);
  const walk = mode === "light" ? shadeOrder.slice(start) : shadeOrder.slice(0, start + 1).reverse();
  const passes = (shade: ColorShade) => backgrounds.every((bg) => meetsAA(ramp[shade], bg, AA_LARGE_OR_UI_MIN));
  return walk.find(passes) ?? (walk[walk.length - 1] as ColorShade);
}

/** Bir vurgu renginden, verilen modun zeminine göre düzeltilmiş `primary` rolü. */
export function buildAccentRole(anchor: HexColor, mode: ThemeMode): SemanticColorRole {
  const canvas = (mode === "light" ? lightTheme : darkTheme).color.canvas;
  const surface = canvas.surface as HexColor;
  const surfaceAlt = canvas.surfaceAlt as HexColor;
  const ramp = generateRamp(anchor);
  return deriveColorRole(ramp, surface, mode, accessibleSolidShade(ramp, mode, [surface, surfaceAlt]), surfaceAlt);
}

/**
 * Kullanıcı ayarının gerektirdiği CSS değişkenleri — YALNIZ varsayılandan
 * farklı olanlar (`--mari-color-primary*` + primary'den türeyen `--mari-color-ring`).
 * Vurgu rengi yoksa boş obje: mod `data-theme`, yoğunluk `data-density` ile
 * stylesheet'ten gelir. Saf fonksiyon; DOM'a uygulama `applyTheme`in işi
 * (`@mari-ui/components/theme-customizer`), çünkü bu paket native'de de çalışır.
 */
export function buildThemeVars(settings: Pick<ThemeSettings, "primary">, mode: ThemeMode): Record<string, string> {
  if (!settings.primary) return {};
  const base = mode === "light" ? lightTheme : darkTheme;
  const primary = buildAccentRole(settings.primary, mode);
  const vars = themeToCssVariables({ ...base, color: { ...base.color, primary, canvas: { ...base.color.canvas, ring: primary.text } } });
  return Object.fromEntries(Object.entries(vars).filter(([name]) => name.startsWith("--mari-color-primary") || name === "--mari-color-ring"));
}
