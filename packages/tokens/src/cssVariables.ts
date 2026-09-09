import type { Theme } from "./theme";
import type { SemanticColorRole } from "./semantic/deriveColorRole";

/**
 * `--mari-space-0.5` gibi kesirli spacing anahtarlarındaki nokta bazı
 * minifier/optimizer'ları (fiilen Tailwind'in lightningcss adımında
 * görüldü) sayı token'ı sanıp uyarı veriyor — değeri değil, adı değiştirir.
 */
function cssSafeKey(key: string): string {
  return key.replace(".", "_");
}

function colorRoleVars(prefix: string, role: SemanticColorRole): Record<string, string> {
  return {
    [`--mari-color-${prefix}`]: role.text,
    [`--mari-color-${prefix}-solid`]: role.solid,
    [`--mari-color-${prefix}-solid-contrast`]: role.solidContrast,
    [`--mari-color-${prefix}-solid-hover`]: role.solidHover,
    [`--mari-color-${prefix}-subtle`]: role.subtle,
    [`--mari-color-${prefix}-subtle-contrast`]: role.subtleContrast,
    [`--mari-color-${prefix}-border`]: role.border,
  };
}

/**
 * Bir `Theme`in TÜMÜNÜ (`--mari-*`) düz bir CSS custom property haritasına
 * çevirir. Hem `scripts/build-css.ts` (derleme zamanında `dist/theme.css`
 * üretir) HEM DE tema stüdyosu (Faz 6, `apps/studio` — çalışma zamanında
 * canlı önizleme için bir DOM node'a inline `style` olarak uygular) AYNI bu
 * fonksiyonu çağırır. Mapping iki yerde ayrı ayrı elle tutulmuyor — biri
 * güncellenip diğeri unutulursa (build script ile stüdyo sessizce
 * birbirinden sapardı) diye tek kaynak.
 */
export function themeToCssVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const role of ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const) {
    Object.assign(vars, colorRoleVars(role, theme.color[role]));
  }

  const c = theme.color.canvas;
  vars["--mari-color-surface"] = c.surface;
  vars["--mari-color-surface-alt"] = c.surfaceAlt;
  vars["--mari-color-border"] = c.border;
  vars["--mari-color-input"] = c.input;
  vars["--mari-color-ring"] = c.ring;
  vars["--mari-color-scrim"] = c.scrim;
  vars["--mari-color-foreground"] = c.foreground;
  vars["--mari-color-muted"] = c.muted;
  vars["--mari-color-disabled"] = c.disabled;

  for (const [key, value] of Object.entries(theme.spacing)) vars[`--mari-space-${cssSafeKey(key)}`] = value;
  for (const [key, value] of Object.entries(theme.radius)) vars[`--mari-radius-${key}`] = value;
  for (const [key, value] of Object.entries(theme.fontSize)) vars[`--mari-font-size-${key}`] = value;
  for (const [key, value] of Object.entries(theme.fontWeight)) vars[`--mari-font-weight-${key}`] = value;
  for (const [key, value] of Object.entries(theme.lineHeight)) vars[`--mari-line-height-${key}`] = value;
  for (const [key, value] of Object.entries(theme.shadow)) vars[`--mari-shadow-${key}`] = value;
  for (const [key, value] of Object.entries(theme.zIndex)) vars[`--mari-z-${key}`] = String(value);
  for (const [key, value] of Object.entries(theme.duration)) vars[`--mari-duration-${key}`] = value;
  for (const [key, value] of Object.entries(theme.easing)) vars[`--mari-easing-${key}`] = value;
  vars["--mari-font-sans"] = theme.fontFamily.sans;
  vars["--mari-font-mono"] = theme.fontFamily.mono;

  return vars;
}
