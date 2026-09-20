import { cn, type Size } from "@mari-ui/core";
import { elevationClass } from "../lib/elevationClass";

export interface CardBaseClassOptions {
  bordered?: boolean;
  hoverable?: boolean;
  size?: Size;
  inset?: boolean;
  className?: string;
}

/**
 * ant.design'ın gerçek Card'ından (`getComputedStyle`, `sm`→small: 12px
 * header/body padding + 14px başlık; `md`/`lg`→default: 24px padding + 16px
 * başlık) alınan padding/başlık-boyutu çifti. Eskiden `size` sadece
 * `fontSizeClass` (yalnızca font-size) uyguluyordu, padding hep sabit `p-4`
 * kalıyordu — ant'ın "small" kartı çok daha kompakt, "default" çok daha
 * ferahtır; tek bir ara değer ikisini de yanlış temsil ediyordu.
 */
const BODY_PADDING_CLASS: Record<Size, string> = { sm: "p-3", md: "p-6", lg: "p-6" };
/** ant başlığı dikey dolgu yerine `min-height` + yatay dolgu kullanır (38px küçük / 56px varsayılan). */
const HEADER_PADDING_CLASS: Record<Size, string> = {
  sm: "px-3 min-h-[2.375rem]",
  md: "px-6 min-h-14",
  lg: "px-6 min-h-14",
};
const HEADER_TEXT_CLASS: Record<Size, string> = { sm: "text-sm", md: "text-base", lg: "text-base" };

export function getBaseClassname({ bordered = true, hoverable, inset, className }: CardBaseClassOptions): string {
  return cn(
    "relative rounded-lg bg-mari-surface",
    bordered && "border border-mari-border",
    hoverable && cn(elevationClass.sm, "transition-shadow"),
    inset && "bg-mari-surface-alt border border-mari-border",
    className
  );
}

export function getBodyPaddingClass(size: Size | undefined): string {
  return BODY_PADDING_CLASS[size ?? "md"];
}

export function getHeaderClasses(size: Size | undefined): { padding: string; text: string } {
  const resolved = size ?? "md";
  return { padding: HEADER_PADDING_CLASS[resolved], text: HEADER_TEXT_CLASS[resolved] };
}
