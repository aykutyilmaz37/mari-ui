import { cn, resolveColorVariant, type ColorRole, type Variant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";

/**
 * @deprecated Eski `statu` prop'unun değerleri. "processing" -> `info`,
 * "default" -> `neutral`. Eski prop, RENK ekseninde bir yazım hatası
 * ("statu", "status" değil) taşıyordu ve tag/utils.ts'teki `color?: string`
 * hiçbir zaman gerçekten kullanılmıyordu (runtime'da `` `bg-[${color}]` ``
 * template literal'i Tailwind'in tarayıcısı tarafından hiç görülmüyordu).
 */
export type LegacyTagStatu = "success" | "processing" | "error" | "default" | "warning";

const LEGACY_STATU_TO_COLOR: Record<LegacyTagStatu, ColorRole> = {
  success: "success",
  error: "error",
  warning: "warning",
  processing: "info",
  default: "neutral",
};

export function resolveLegacyTagColor(statu: LegacyTagStatu | undefined, color: ColorRole | undefined): ColorRole {
  if (color) return color;
  if (statu) {
    if (process.env.NODE_ENV !== "production") {
      console.warn('[@mari-ui/components] Tag: "statu" deprecated, `color` (ColorRole) kullanın.');
    }
    return LEGACY_STATU_TO_COLOR[statu];
  }
  return "neutral";
}

export function getTagClass(
  color: ColorRole,
  variant: Extract<Variant, "solid" | "soft" | "outline">,
  bordered: boolean | undefined,
  className: string | undefined
): string {
  const colorClasses = colorVariantToClassName(resolveColorVariant(color, variant));
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium",
    colorClasses,
    bordered && variant !== "outline" && "border",
    className
  );
}
