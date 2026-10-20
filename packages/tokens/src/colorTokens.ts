import type { CanvasTokens, ColorRole, SemanticColorTokens } from "./semantic/colors";
import type { SemanticColorRole } from "./semantic/deriveColorRole";
import type { HexColor } from "./contrast";

const ROLES = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const satisfies readonly ColorRole[];

const ROLE_SUFFIX = {
  "": "text",
  "-solid": "solid",
  "-solid-contrast": "solidContrast",
  "-solid-hover": "solidHover",
  "-subtle": "subtle",
  "-subtle-contrast": "subtleContrast",
  "-border": "border",
} as const satisfies Record<string, keyof SemanticColorRole>;

const CANVAS_KEYS = {
  surface: "surface",
  "surface-alt": "surfaceAlt",
  border: "border",
  input: "input",
  ring: "ring",
  scrim: "scrim",
  foreground: "foreground",
  muted: "muted",
  disabled: "disabled",
  rating: "rating",
  "rating-stroke": "ratingStroke",
} as const satisfies Record<string, keyof CanvasTokens>;

type RoleTokenName = `${ColorRole}${keyof typeof ROLE_SUFFIX}`;
type ChartTokenName = `chart-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

/** `--mari-color-<ad>` değişkeninin `<ad>` kısmı — config'te ezilebilen her renk. */
export type ColorTokenName = RoleTokenName | keyof typeof CANVAS_KEYS | ChartTokenName;

/** Türetilmiş değerin yerine birebir yazılacak renkler (`"surface": "#fbf8f3"`). Kontrast denetimi yapılmaz. */
export type ColorTokenOverrides = Partial<Record<ColorTokenName, string>>;

/** Sıralı tüm renk token adları — Tailwind `@theme` eşlemesi ve şema bu listeden okur. */
// `@__PURE__` IIFE: modül seviyesindeki hesaplama, kullanılmadığında tüketici bundle'ından düşebilsin.
export const colorTokenNames: ColorTokenName[] = /* @__PURE__ */ (() => [
  ...ROLES.flatMap((role) => Object.keys(ROLE_SUFFIX).map((suffix) => `${role}${suffix}` as RoleTokenName)),
  ...(Object.keys(CANVAS_KEYS) as Array<keyof typeof CANVAS_KEYS>),
  ...Array.from({ length: 8 }, (_, i) => `chart-${i + 1}` as ChartTokenName),
])();

const tokenNameSet = /* @__PURE__ */ new Set<string>(colorTokenNames);

export function isColorTokenName(name: string): name is ColorTokenName {
  return tokenNameSet.has(name);
}

/**
 * Ezmeleri `SemanticColorTokens`a uygular (native `theme.color` da görsün diye).
 * `chart-*` burada yok — grafik paleti temada değil, CSS çıktısında ezilir.
 */
export function applyColorTokenOverrides(color: SemanticColorTokens, overrides: ColorTokenOverrides = {}): SemanticColorTokens {
  const next: SemanticColorTokens = { ...color, canvas: { ...color.canvas } };
  for (const [name, value] of Object.entries(overrides)) {
    if (!value) continue;
    if (name in CANVAS_KEYS) {
      next.canvas[CANVAS_KEYS[name as keyof typeof CANVAS_KEYS]] = value;
      continue;
    }
    const role = ROLES.find((r) => name === r || name.startsWith(`${r}-`));
    const field = role && ROLE_SUFFIX[name.slice(role.length) as keyof typeof ROLE_SUFFIX];
    if (role && field) next[role] = { ...next[role], [field]: value as HexColor };
  }
  return next;
}
