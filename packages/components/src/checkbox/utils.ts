import { cn, type ColorRole, type Size, type Variant } from "@mari-ui/core";
import { borderColorClass, textSolidContrastClass } from "../lib/colorClasses";
import type { CheckboxShape, LegacyCheckboxType } from "./types";

const LEGACY_TYPE_TO_COLOR: Record<LegacyCheckboxType, ColorRole> = {
  primary: "primary",
  secondary: "neutral",
};

/**
 * Eskiden `status` (error/warning) ve `type` (primary/secondary) İKİ AYRI
 * eksendi ve `status` varsa `type`'ın renk sınıfları TAMAMEN atlanıyordu.
 * `error`/`warning` zaten birer `ColorRole` olduğu için tek eksene
 * indirgendi: `status` verilmişse o `color` olarak kullanılır.
 *
 * `undefined` dönebilir (eskiden `?? "primary"` vardı) — "renk AÇIKÇA
 * verilmedi" ile "primary açıkça seçildi" ayrımı `getVariantClasses`'ın
 * dinlenme halindeki kenarlığı nötr/gri mi yoksa kalıcı renkli mi
 * çizeceğine karar vermesi için korunur (bkz. Faz 13 kullanıcı geri
 * bildirimi — checked OLMAYAN kutucuk mavi görünmemeli).
 */
export function resolveCheckboxColor(props: {
  color?: ColorRole;
  status?: "error" | "warning";
  type?: LegacyCheckboxType;
}): ColorRole | undefined {
  if (props.status) return props.status;
  if (props.color) return props.color;
  if (props.type) return LEGACY_TYPE_TO_COLOR[props.type];
  return undefined;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-3 w-3 text-xs",
  md: "h-4 w-4 text-sm",
  lg: "h-5 w-5 text-base",
};

const INDETERMINATE_SIZE_CLASS: Record<Size, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function getSizeClasses(size: Size): string {
  return SIZE_CLASS[size];
}

export function getIndeterminateSizeClasses(size: Size): string {
  return INDETERMINATE_SIZE_CLASS[size];
}

export function getShapeClasses(shape: CheckboxShape): string {
  return { square: "rounded-none", pill: "rounded-full px-4", default: "rounded-md" }[shape];
}

/**
 * `checked:` pseudo-class varyantları — literal string, `${role}`
 * interpolasyonu YOK. `colorClasses.ts`'teki tablolar zaten "hover:" önekli
 * geliyor; onları çalışma zamanında `.replace()` edip yeniden birleştirmek
 * ("checked:" + temizlenmiş sonuç) Tailwind'in tarayıcısının asla
 * göremeyeceği bir string üretirdi — Skeleton/Loading'i bozan hatanın
 * üçüncü tekrarı olurdu. Bunun yerine ayrı, tam literal bir tablo.
 */
const CHECKED_BG_SOLID_CLASS: Record<ColorRole, string> = {
  primary: "checked:bg-mari-primary-solid",
  accent: "checked:bg-mari-accent-solid",
  success: "checked:bg-mari-success-solid",
  error: "checked:bg-mari-error-solid",
  warning: "checked:bg-mari-warning-solid",
  info: "checked:bg-mari-info-solid",
  neutral: "checked:bg-mari-neutral-solid",
};

const CHECKED_BG_SOLID_HOVER_CLASS: Record<ColorRole, string> = {
  primary: "checked:hover:bg-mari-primary-solid-hover",
  accent: "checked:hover:bg-mari-accent-solid-hover",
  success: "checked:hover:bg-mari-success-solid-hover",
  error: "checked:hover:bg-mari-error-solid-hover",
  warning: "checked:hover:bg-mari-warning-solid-hover",
  info: "checked:hover:bg-mari-info-solid-hover",
  neutral: "checked:hover:bg-mari-neutral-solid-hover",
};

/** Sadece İŞARETLİYKEN kenarlığı renklendirir — dinlenme halinde nötr/gri kalır. */
const CHECKED_BORDER_CLASS: Record<ColorRole, string> = {
  primary: "checked:border-mari-primary-border",
  accent: "checked:border-mari-accent-border",
  success: "checked:border-mari-success-border",
  error: "checked:border-mari-error-border",
  warning: "checked:border-mari-warning-border",
  info: "checked:border-mari-info-border",
  neutral: "checked:border-mari-neutral-border",
};

/**
 * `color` verilmediyse (yani gerçek bir doğrulama durumu YOKSA) dinlenme
 * halindeki (işaretsiz) kenarlık nötr/gri (`border-mari-input`) — sadece
 * işaretlenince `primary`e (veya AÇIKÇA verilen renge) bürünür. `color`
 * AÇIKÇA verildiyse (örn. `error`) o renk işaretli/işaretsiz HER ZAMAN
 * kalıcıdır (bkz. `input/utils.ts`'teki aynı desen).
 */
export function getVariantClasses(variant: Extract<Variant, "solid" | "outline">, color: ColorRole | undefined): string {
  const fillColor = color ?? "primary";
  if (variant === "solid") {
    return cn(CHECKED_BG_SOLID_CLASS[fillColor], CHECKED_BG_SOLID_HOVER_CLASS[fillColor], "border-transparent bg-mari-surface-alt");
  }
  const restBorderClass = color ? borderColorClass[color] : "border-mari-input";
  return cn("bg-mari-surface", restBorderClass, CHECKED_BG_SOLID_CLASS[fillColor], CHECKED_BORDER_CLASS[fillColor], textSolidContrastClass[fillColor]);
}
