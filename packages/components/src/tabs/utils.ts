import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { bgSolidClass, bgSubtleClass, textClass, textSubtleContrastClass } from "../lib/colorClasses";
import type { TabsOrientation, TabsVariant } from "./types";

/**
 * Yapı ant.design Tabs'tan (çizgili: 12px dikey dolgu, 32px aralık, 2px
 * gösterge, 1px taban; kart: 8/16px dolgu, 2px aralık, üst köşeler 8px),
 * görünüm kendi token'larımızdan. Tüm class'lar literal — Tailwind tarayıcısı
 * için (bkz. lib/colorClasses).
 */

const lineSize: Record<Size, string> = {
  sm: "py-2 text-sm",
  md: "py-3 text-sm",
  lg: "py-4 text-base",
};
const lineVerticalSize: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};
const cardSize: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};
const pillsSize: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

const lineGap: Record<Size, string> = { sm: "gap-6", md: "gap-8", lg: "gap-8" };

export function getListClass(variant: TabsVariant, orientation: TabsOrientation, size: Size, fill: boolean): string {
  const vertical = orientation === "vertical";
  return cn(
    "relative flex",
    vertical ? "flex-col items-stretch" : "items-center",
    fill && !vertical && "w-full",
    variant === "line" && (vertical ? "gap-1" : lineGap[size]),
    variant === "card" && "gap-0.5",
    variant === "pills" && "gap-1 rounded-lg bg-mari-surface-alt p-1"
  );
}

/**
 * Taban çizgisi dış kapsayıcıda `inset` gölge olarak çiziliyor (border değil):
 * inset gölge çocukların ALTINDA boyanır, böylece gösterge (line) ve aktif
 * kartın alt kenarı (card) çizginin ÜSTÜNE biner — ant.design ile aynı.
 */
export function getBarClass(variant: TabsVariant, orientation: TabsOrientation): string {
  if (variant === "pills") return "";
  return orientation === "vertical"
    ? "shadow-[inset_-1px_0_0_var(--color-mari-border)]"
    : "shadow-[inset_0_-1px_0_var(--color-mari-border)]";
}

function triggerJustify(vertical: boolean, fill: boolean): string {
  if (vertical) return "justify-start";
  return fill ? "flex-1 justify-center" : "justify-center";
}

export function getTriggerClass(opts: {
  active: boolean;
  variant: TabsVariant;
  orientation: TabsOrientation;
  size: Size;
  color: ColorRole;
  fill: boolean;
}): string {
  const { active, variant, orientation, size, color, fill } = opts;
  const vertical = orientation === "vertical";
  const base = cn(
    "relative inline-flex shrink-0 select-none items-center gap-2 whitespace-nowrap font-medium",
    "transition-colors duration-150 motion-reduce:transition-none",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring",
    triggerJustify(vertical, fill)
  );

  if (variant === "card") {
    return cn(
      base,
      cardSize[size],
      "border border-mari-border",
      vertical ? "rounded-l-lg border-r-0" : "rounded-t-lg border-b-0",
      active
        ? cn("bg-mari-surface", textClass[color], vertical && "-mr-px")
        : "bg-mari-surface-alt text-mari-muted enabled:hover:text-mari-foreground"
    );
  }

  if (variant === "pills") {
    return cn(
      base,
      pillsSize[size],
      "z-10 rounded-md",
      active ? "text-mari-foreground" : "text-mari-muted enabled:hover:text-mari-foreground"
    );
  }

  return cn(
    base,
    vertical ? lineVerticalSize[size] : lineSize[size],
    vertical && "rounded-l-md",
    active ? textClass[color] : "text-mari-muted enabled:hover:text-mari-foreground"
  );
}

export function getIndicatorClass(variant: TabsVariant, orientation: TabsOrientation, color: ColorRole): string {
  if (variant === "pills") return "rounded-md bg-mari-surface shadow-mari-sm ring-1 ring-mari-border/60";
  if (variant === "card") return "hidden";
  return cn(bgSolidClass[color], orientation === "vertical" ? "right-0 w-0.5" : "bottom-0 h-0.5", "rounded-full");
}

export function getCountClass(active: boolean, color: ColorRole): string {
  return cn(
    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums leading-5",
    active ? cn(bgSubtleClass[color], textSubtleContrastClass[color]) : "bg-mari-neutral-subtle text-mari-muted"
  );
}
