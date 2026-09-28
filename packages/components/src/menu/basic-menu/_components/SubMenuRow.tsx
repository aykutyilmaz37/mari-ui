"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemType } from "../../types";

/** Literal tablolar — Tailwind birleştirilmiş/dinamik sınıf adlarını taramaz. */
const TILE_HOVER_CLASS: Record<ColorRole, string> = {
  primary: "group-hover/row:bg-mari-primary-subtle group-hover/row:text-mari-primary",
  accent: "group-hover/row:bg-mari-accent-subtle group-hover/row:text-mari-accent",
  success: "group-hover/row:bg-mari-success-subtle group-hover/row:text-mari-success",
  error: "group-hover/row:bg-mari-error-subtle group-hover/row:text-mari-error",
  warning: "group-hover/row:bg-mari-warning-subtle group-hover/row:text-mari-warning",
  info: "group-hover/row:bg-mari-info-subtle group-hover/row:text-mari-info",
  neutral: "group-hover/row:bg-mari-neutral-subtle group-hover/row:text-mari-neutral",
};
const TILE_ACTIVE_CLASS: Record<ColorRole, string> = {
  primary: "bg-mari-primary-subtle text-mari-primary",
  accent: "bg-mari-accent-subtle text-mari-accent",
  success: "bg-mari-success-subtle text-mari-success",
  error: "bg-mari-error-subtle text-mari-error",
  warning: "bg-mari-warning-subtle text-mari-warning",
  info: "bg-mari-info-subtle text-mari-info",
  neutral: "bg-mari-neutral-subtle text-mari-neutral",
};
const TITLE_HOVER_CLASS: Record<ColorRole, string> = {
  primary: "group-hover/row:text-mari-primary",
  accent: "group-hover/row:text-mari-accent",
  success: "group-hover/row:text-mari-success",
  error: "group-hover/row:text-mari-error",
  warning: "group-hover/row:text-mari-warning",
  info: "group-hover/row:text-mari-info",
  neutral: "group-hover/row:text-mari-neutral",
};
const TITLE_ACTIVE_CLASS: Record<ColorRole, string> = {
  primary: "text-mari-primary",
  accent: "text-mari-accent",
  success: "text-mari-success",
  error: "text-mari-error",
  warning: "text-mari-warning",
  info: "text-mari-info",
  neutral: "text-mari-neutral",
};

/** Satırın kendisi (buton ya da `DropdownTrigger`) için ortak kutu sınıfları. */
export function getSubMenuRowClass(item: MenuItemType): string {
  return cn(
    "group/row flex w-full gap-3 rounded-lg p-2.5 text-start transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring",
    item.description ? "items-start" : "items-center",
    item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-mari-surface-alt"
  );
}

export interface SubMenuRowContentProps {
  item: MenuItemType;
  active: boolean;
  color: ColorRole;
  /** Satırın sağında (örn. iç içe alt menü için chevron). */
  trailing?: React.ReactNode;
}

/**
 * Alt menü satırının içeriği: ikon karosu + başlık + (varsa) açıklama. Modern
 * nav menülerindeki (Stripe, Vercel, Linear) "ikon + başlık + tek satır
 * açıklama" yapısı; renkler tamamen kendi token'larımızdan — karo dinlenmede
 * nötr, hover/aktifte seçili rengin `-subtle` zemini + asıl rengi.
 */
export function SubMenuRowContent({ item, active, color, trailing }: SubMenuRowContentProps) {
  const interactive = !item.disabled;
  return (
    <>
      {item.icon && (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 [&_svg]:size-[1.125rem]",
            active ? TILE_ACTIVE_CLASS[color] : cn("bg-mari-surface-alt text-mari-muted", interactive && TILE_HOVER_CLASS[color])
          )}
        >
          {item.icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-sm font-medium transition-colors duration-150", active ? TITLE_ACTIVE_CLASS[color] : cn("text-mari-foreground", interactive && TITLE_HOVER_CLASS[color]))}>
          {item.title}
        </span>
        {item.description && <span className="line-clamp-2 text-xs leading-snug text-mari-muted">{item.description}</span>}
      </span>
      {trailing}
    </>
  );
}
