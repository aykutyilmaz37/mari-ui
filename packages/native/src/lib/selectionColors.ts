import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";

export type SelectionVariant = "solid" | "outline";

export interface SelectionColors {
  background: string;
  border: string;
  /** Tik / nokta rengi. */
  mark: string;
}

/**
 * Checkbox kutusu — web `checkbox/utils.getVariantClasses` ile aynı kurallar:
 * dinlenirken nötr `input` kenarı (renk verilmişse rolün kendisi — doğrulama
 * durumu), seçilince rol dolgusu + kontrast tik. `solid`: dinlenirken tonlu
 * zemin, kenarsız.
 */
export function checkboxColors(theme: Theme, variant: SelectionVariant, color: ColorRole | undefined, on: boolean): SelectionColors {
  const role = theme.color[color ?? "primary"];
  if (on) return { background: role.solid, border: role.solid, mark: role.solidContrast };
  if (variant === "solid") return { background: theme.color.canvas.surfaceAlt, border: theme.color.canvas.surfaceAlt, mark: "transparent" };
  return { background: theme.color.canvas.surface, border: color ? theme.color[color].text : theme.color.canvas.input, mark: "transparent" };
}

/**
 * Radio dairesi — web `radio/utils`: `outline` seçilince kenar rol rengi + dolu
 * nokta; `solid` seçilince rol dolgusu + yüzey renginde nokta.
 */
export function radioColors(theme: Theme, variant: SelectionVariant, color: ColorRole | undefined, on: boolean): SelectionColors {
  const role = theme.color[color ?? "primary"];
  const restBorder = color ? theme.color[color].text : theme.color.canvas.input;
  if (variant === "solid") {
    return on ? { background: role.solid, border: role.solid, mark: theme.color.canvas.surface } : { background: theme.color.canvas.surfaceAlt, border: restBorder, mark: "transparent" };
  }
  return { background: theme.color.canvas.surface, border: on ? role.text : restBorder, mark: on ? role.solid : "transparent" };
}

/**
 * Switch izi — kullanıcı kuralları: kapalı hal HER renkte nötr gri (`input`;
 * iç metin varsa okunur kalsın diye nötr dolgu), açık hal rol dolgusu; topuz
 * her zaman beyaz.
 */
export function switchTrackColor(theme: Theme, color: ColorRole, on: boolean, hasLabel: boolean): string {
  if (on) return theme.color[color].solid;
  return hasLabel ? theme.color.neutral.solid : theme.color.canvas.input;
}
