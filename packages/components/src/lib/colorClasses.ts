import { cn, type ColorRole, type ColorVariantStyle } from "@mari-ui/core";

/**
 * `@mari-ui/tokens`'ın ürettiği `--color-mari-*` CSS değişkenlerine karşılık
 * gelen Tailwind utility class'ları.
 *
 * ÖNEMLİ: Her class ismi burada HARFİ HARFİNE, literal string olarak
 * yazılıdır — `` `bg-mari-${role}-solid` `` gibi bir template literal
 * KULLANILMAZ. Sebebi: Tailwind'in derleme-zamanı tarayıcısı kaynak
 * dosyanın METNİNİ okur, kodu çalıştırmaz. `${role}` içeren bir satır
 * çalışma zamanında "bg-mari-primary-solid" olur ama tarayıcı bunu asla
 * göremez — kaynak metinde hâlâ kesik bir template literal olarak durur.
 * Bu repoda `Skeleton`/`Tag`/`Loading`'i sessizce bozan hata tam olarak
 * buydu (bkz. plan Faz 3); burada aynı hatayı tekrarlamamak için tabloyu
 * elle, tam string'lerle yazıyoruz.
 */
export const bgSolidClass: Record<ColorRole, string> = {
  primary: "bg-mari-primary-solid",
  accent: "bg-mari-accent-solid",
  success: "bg-mari-success-solid",
  error: "bg-mari-error-solid",
  warning: "bg-mari-warning-solid",
  info: "bg-mari-info-solid",
  neutral: "bg-mari-neutral-solid",
};

export const bgSolidHoverClass: Record<ColorRole, string> = {
  primary: "hover:bg-mari-primary-solid-hover",
  accent: "hover:bg-mari-accent-solid-hover",
  success: "hover:bg-mari-success-solid-hover",
  error: "hover:bg-mari-error-solid-hover",
  warning: "hover:bg-mari-warning-solid-hover",
  info: "hover:bg-mari-info-solid-hover",
  neutral: "hover:bg-mari-neutral-solid-hover",
};

export const textSolidContrastClass: Record<ColorRole, string> = {
  primary: "text-mari-primary-solid-contrast",
  accent: "text-mari-accent-solid-contrast",
  success: "text-mari-success-solid-contrast",
  error: "text-mari-error-solid-contrast",
  warning: "text-mari-warning-solid-contrast",
  info: "text-mari-info-solid-contrast",
  neutral: "text-mari-neutral-solid-contrast",
};

export const bgSubtleClass: Record<ColorRole, string> = {
  primary: "bg-mari-primary-subtle",
  accent: "bg-mari-accent-subtle",
  success: "bg-mari-success-subtle",
  error: "bg-mari-error-subtle",
  warning: "bg-mari-warning-subtle",
  info: "bg-mari-info-subtle",
  neutral: "bg-mari-neutral-subtle",
};

export const textSubtleContrastClass: Record<ColorRole, string> = {
  primary: "text-mari-primary-subtle-contrast",
  accent: "text-mari-accent-subtle-contrast",
  success: "text-mari-success-subtle-contrast",
  error: "text-mari-error-subtle-contrast",
  warning: "text-mari-warning-subtle-contrast",
  info: "text-mari-info-subtle-contrast",
  neutral: "text-mari-neutral-subtle-contrast",
};

export const textClass: Record<ColorRole, string> = {
  primary: "text-mari-primary",
  accent: "text-mari-accent",
  success: "text-mari-success",
  error: "text-mari-error",
  warning: "text-mari-warning",
  info: "text-mari-info",
  neutral: "text-mari-neutral",
};

/** `textClass`in `hover:` varyantı — örn. Menu öğelerinde primary rengi SADECE hover metin rengi olarak uygulamak için. */
export const textHoverClass: Record<ColorRole, string> = {
  primary: "hover:text-mari-primary",
  accent: "hover:text-mari-accent",
  success: "hover:text-mari-success",
  error: "hover:text-mari-error",
  warning: "hover:text-mari-warning",
  info: "hover:text-mari-info",
  neutral: "hover:text-mari-neutral",
};

export const borderColorClass: Record<ColorRole, string> = {
  primary: "border-mari-primary-border",
  accent: "border-mari-accent-border",
  success: "border-mari-success-border",
  error: "border-mari-error-border",
  warning: "border-mari-warning-border",
  info: "border-mari-info-border",
  neutral: "border-mari-neutral-border",
};

/** `borderColorClass`in `hover:` varyantı. */
export const borderColorHoverClass: Record<ColorRole, string> = {
  primary: "hover:border-mari-primary-border",
  accent: "hover:border-mari-accent-border",
  success: "hover:border-mari-success-border",
  error: "hover:border-mari-error-border",
  warning: "hover:border-mari-warning-border",
  info: "hover:border-mari-info-border",
  neutral: "hover:border-mari-neutral-border",
};

/** SVG `fill`/`stroke` için — örn. Tooltip'in ok işareti. */
export const fillSolidClass: Record<ColorRole, string> = {
  primary: "fill-mari-primary-solid",
  accent: "fill-mari-accent-solid",
  success: "fill-mari-success-solid",
  error: "fill-mari-error-solid",
  warning: "fill-mari-warning-solid",
  info: "fill-mari-info-solid",
  neutral: "fill-mari-neutral-solid",
};

export const strokeSolidClass: Record<ColorRole, string> = {
  primary: "stroke-mari-primary-solid",
  accent: "stroke-mari-accent-solid",
  success: "stroke-mari-success-solid",
  error: "stroke-mari-error-solid",
  warning: "stroke-mari-warning-solid",
  info: "stroke-mari-info-solid",
  neutral: "stroke-mari-neutral-solid",
};

/** `soft` varyantlı yüzeyler (örn. Tooltip'in soft rengi) için — arka planla eşleşsin diye SVG `fill`. */
export const fillSubtleClass: Record<ColorRole, string> = {
  primary: "fill-mari-primary-subtle",
  accent: "fill-mari-accent-subtle",
  success: "fill-mari-success-subtle",
  error: "fill-mari-error-subtle",
  warning: "fill-mari-warning-subtle",
  info: "fill-mari-info-subtle",
  neutral: "fill-mari-neutral-subtle",
};

export const strokeSubtleClass: Record<ColorRole, string> = {
  primary: "stroke-mari-primary-subtle",
  accent: "stroke-mari-accent-subtle",
  success: "stroke-mari-success-subtle",
  error: "stroke-mari-error-subtle",
  warning: "stroke-mari-warning-subtle",
  info: "stroke-mari-info-subtle",
  neutral: "stroke-mari-neutral-subtle",
};

/**
 * `resolveColorVariant()`'ın döndürdüğü soyut token referanslarını gerçek
 * Tailwind class'larına çevirir. Web renderer'ının (bu paketin) tek görevi
 * budur — aynı soyut çıktı, `@mari-ui/native`'de `StyleSheet` objesine
 * çevrilir.
 */
export function colorVariantToClassName(style: ColorVariantStyle): string {
  const slotTable = {
    text: textClass,
    solid: bgSolidClass,
    solidContrast: textSolidContrastClass,
    solidHover: bgSolidHoverClass,
    subtle: bgSubtleClass,
    subtleContrast: textSubtleContrastClass,
    border: borderColorClass,
  } as const;

  const bg = style.background ? slotTable[style.background.slot][style.background.role] : undefined;
  const hoverBg = style.hoverBackground
    ? slotTable[style.hoverBackground.slot][style.hoverBackground.role]
    : undefined;
  const text = style.foreground ? slotTable[style.foreground.slot][style.foreground.role] : undefined;
  const border = style.border ? slotTable[style.border.slot][style.border.role] : undefined;

  return cn(bg, hoverBg, text, border, border && "border");
}
