import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass, textSolidContrastClass } from "../lib/colorClasses";
import { skeletonFill } from "../lib/skeleton";
import type { BadgeProps, StatusBadgeProps } from "./types";

export type { BadgeProps, StatusBadgeProps };

/** Kabarcık boyutu rem (px yasak kuralı): sm 16 / md 20px, metin 10 / 12px. */
const BUBBLE_SIZE = { sm: "h-4 min-w-4 px-1 text-[0.625rem]", md: "h-5 min-w-5 px-1.5 text-xs" } as const;
const DOT_SIZE = { sm: "size-1.5", md: "size-2" } as const;

const toLength = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

function displayCount(count: BadgeProps["count"], overflowCount: number): string | null {
  if (count === undefined || count === null || count === "") return null;
  if (typeof count === "number") return count > overflowCount ? `${overflowCount}+` : String(count);
  return count;
}

/**
 * Faz 16.2 — yapı ant.design Badge'den. Bir öğenin (bildirim zili, avatar)
 * köşesinde sayı ya da nokta; `children` yoksa satır içinde tek başına.
 *
 * Erişilebilirlik: kabarcık görseldir (`aria-hidden`) — sarılan düğmenin
 * yanında ayrı bir "3" okunması anlamsız olurdu. Sayı ya `label` ile gizli
 * metin olarak verilir ya da (daha iyisi) düğmenin kendi adına katılır.
 * Kabarcığın etrafında yüzey renginde halka: avatarın/ikonun üstünde ayrışsın.
 */
export function Badge({
  count,
  overflowCount = 99,
  showZero = false,
  dot = false,
  color = "error",
  size = "md",
  label,
  offset,
  children,
  className,
  skeleton = false,
}: Readonly<BadgeProps>) {
  const text = displayCount(count, overflowCount);
  const hidden = !dot && (text === null || (count === 0 && !showZero));
  const standalone = children === undefined;

  const bubble = hidden ? null : (
    <span
      aria-hidden
      data-badge=""
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none tabular-nums whitespace-nowrap",
        dot ? DOT_SIZE[size] : BUBBLE_SIZE[size],
        skeleton ? cn(skeletonFill(true), "text-transparent") : cn(bgSolidClass[color], textSolidContrastClass[color]),
        !standalone && "absolute right-0 top-0 z-10 translate-x-1/2 -translate-y-1/2 ring-2 ring-mari-surface"
      )}
      style={offset ? { marginRight: `calc(${toLength(offset[0])} * -1)`, marginTop: toLength(offset[1]) } : undefined}
    >
      {dot ? null : text}
    </span>
  );

  const srText = label && !hidden && !skeleton ? <span className="sr-only">{label}</span> : null;

  if (standalone) {
    return (
      <span className={cn("inline-flex", className)}>
        {bubble}
        {srText}
      </span>
    );
  }
  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      {bubble}
      {srText}
    </span>
  );
}

const STATUS_DOT: Record<ColorRole, string> = bgSolidClass;

/**
 * Durum rozeti: renkli nokta + metin (tablo satırında "Aktif", "Beklemede").
 * Renk tek başına anlam taşımaz (renk körlüğü) — metin her zaman görünür.
 */
export function StatusBadge({ color = "neutral", children, processing = false, className, skeleton = false }: Readonly<StatusBadgeProps>) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-mari-foreground", className)} aria-hidden={skeleton || undefined}>
      <span className="relative flex size-2 shrink-0">
        {processing && !skeleton && (
          <span aria-hidden className={cn("absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden", STATUS_DOT[color])} />
        )}
        <span aria-hidden className={cn("relative size-2 rounded-full", skeleton ? skeletonFill(true) : STATUS_DOT[color])} />
      </span>
      <span className={cn(skeleton && cn("rounded-sm text-transparent", skeletonFill(true)))}>{children}</span>
    </span>
  );
}
