import { cn, type Size } from "@mari-ui/core";

/*
 * Yapı ant.design Card'ından (başlık: min-height + yatay dolgu, 16px/600;
 * small: 38px başlık + 12px dolgu; default: 56px + 24px), görünüm kendi
 * token'larımızdan. Eskiden `lg` `md` ile birebir aynıydı — artık 32px.
 */
const BODY_PADDING: Record<Size, string> = { sm: "p-3", md: "p-6", lg: "p-8" };
const HEADER: Record<Size, string> = {
  sm: "min-h-[2.375rem] px-3 text-sm",
  md: "min-h-14 px-6 text-base",
  lg: "min-h-16 px-8 text-lg",
};
const FOOTER_PADDING: Record<Size, string> = { sm: "px-3 py-2", md: "px-6 py-4", lg: "px-8 py-5" };
const ACTION_PADDING: Record<Size, string> = { sm: "py-1.5", md: "py-3", lg: "py-3.5" };
const RADIUS: Record<Size, string> = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-xl" };

export interface CardBaseClassOptions {
  bordered?: boolean;
  hoverable?: boolean;
  interactive?: boolean;
  size?: Size;
  inset?: boolean;
  className?: string;
}

export function getBaseClassname({ bordered = true, hoverable, interactive, size = "md", inset, className }: CardBaseClassOptions): string {
  return cn(
    "relative flex min-w-0 flex-col text-left text-mari-foreground",
    RADIUS[size],
    inset ? "bg-mari-surface-alt" : "bg-mari-surface",
    (bordered || inset) && "border border-mari-border",
    // Eskiden `hoverable` gölgeyi HER ZAMAN veriyordu (`hover:` öneki yoktu).
    hoverable &&
      "transition-[box-shadow,translate,border-color] duration-200 hover:shadow-mari-md motion-safe:hover:-translate-y-0.5",
    interactive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    className
  );
}

export const cardPadding = {
  body: (size: Size = "md") => BODY_PADDING[size],
  header: (size: Size = "md") => HEADER[size],
  footer: (size: Size = "md") => FOOTER_PADDING[size],
  action: (size: Size = "md") => ACTION_PADDING[size],
};
