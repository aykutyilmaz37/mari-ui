"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSubtleClass, textClass } from "../../../lib/colorClasses";
import type { MenuItemType } from "../../types";
import { isMenuItemActive } from "../../utils";
import { MenuLink } from "../MenuLink";

export interface MobileNavLevelProps {
  /** Bu seviyede listelenen öğeler. */
  items: MenuItemType[];
  /** İçine girilmiş üst öğeler zinciri — boşsa kök seviyedeyiz. */
  trail: MenuItemType[];
  activeKey: string | null;
  color: ColorRole;
  onDrill: (item: MenuItemType) => void;
  onBack: () => void;
  /** Yaprak / "Tümünü gör" tıklandığında (gezinmeden önce) — host çekmeceyi kapatır. */
  onSelect: (item: MenuItemType) => void;
  onNavigate?: (route: string) => void;
  backRef: React.Ref<HTMLButtonElement>;
}

const ROW_CLASS =
  "flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring";

/**
 * Mobil çekmecenin tek bir seviyesi. Referans mobil menülerin (Amazon/Trendyol
 * çekmecesi) YAPISI: alt seviyede üstte "geri" satırı + seviye başlığı (üst
 * öğenin kendi route'u varsa yanında "Tümünü gör"), altında 48px yüksekliğinde
 * dokunma dostu satırlar; çocuğu olan satır sağda chevron taşır ve bir seviye
 * içeri girer (accordion değil — derin veride liste boyu patlamasın diye).
 */
export function MobileNavLevel({ items, trail, activeKey, color, onDrill, onBack, onSelect, onNavigate, backRef }: MobileNavLevelProps) {
  const parent = trail[trail.length - 1];
  const backLabel = trail[trail.length - 2]?.title ?? "Ana Menü";
  // Seviyede ikonlu bir kardeş varsa ikonsuz satırlar da aynı yeri ayırır — başlıklar tek hizada dursun.
  const reserveIconSlot = items.some((item) => item.icon && !item.heading);

  return (
    <div className="flex flex-col pb-4 transition-[opacity,translate] duration-200 ease-out starting:translate-x-3 starting:opacity-0">
      {parent && (
        <>
          <button
            ref={backRef}
            type="button"
            onClick={onBack}
            className={cn(ROW_CLASS, "cursor-pointer gap-2 border-b border-mari-border font-medium text-mari-muted hover:bg-mari-surface-alt hover:text-mari-foreground")}
          >
            <ChevronLeftIcon aria-hidden="true" size={18} className="shrink-0" />
            {backLabel}
          </button>
          <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
            <span className="text-base font-semibold text-mari-foreground">{parent.title}</span>
            {parent.route && (
              <MenuLink route={parent.route} onNavigate={onNavigate} onSelect={() => onSelect(parent)} className={cn("shrink-0 cursor-pointer text-sm font-medium hover:underline", textClass[color])}>
                Tümünü gör
              </MenuLink>
            )}
          </div>
        </>
      )}

      <ul className="flex flex-col">
        {items.map((item) => {
          if (item.heading) {
            return (
              // Amazon çekmecesinin yapısı: her bölüm bir ayraçla ayrılır, başlığı kalın ve okunur (soluk küçük etiket değil).
              <li key={item.key} className="mt-2 border-t border-mari-border px-4 pt-4 pb-1 text-base font-semibold text-mari-foreground first:mt-0 first:border-t-0 first:pt-3">
                {item.title}
              </li>
            );
          }
          const hasChildren = !!item.children?.length;
          const active = isMenuItemActive(item, activeKey);
          const rowClass = cn(
            ROW_CLASS,
            item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            active ? cn(textClass[color], bgSubtleClass[color], "font-medium") : cn("text-mari-foreground", !item.disabled && "hover:bg-mari-surface-alt")
          );
          const content = (
            <>
              {item.icon ? (
                <span aria-hidden="true" className={cn("flex size-5 shrink-0 items-center justify-center [&_svg]:size-5", !active && "text-mari-muted")}>
                  {item.icon}
                </span>
              ) : (
                reserveIconSlot && <span aria-hidden="true" className="size-5 shrink-0" />
              )}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{item.title}</span>
                {item.description && <span className="line-clamp-1 text-xs text-mari-muted">{item.description}</span>}
              </span>
              {hasChildren && <ChevronRightIcon aria-hidden="true" size={18} className="shrink-0 text-mari-muted" />}
            </>
          );
          // Çocuklu satır bir seviye içeri girer (düğme); yaprak gerçek bir link.
          const row = hasChildren ? (
            <button type="button" data-menu-key={item.key} disabled={item.disabled} onClick={() => onDrill(item)} className={rowClass}>
              {content}
            </button>
          ) : (
            <MenuLink route={item.route} onNavigate={onNavigate} onSelect={() => onSelect(item)} disabled={item.disabled} current={active} className={rowClass}>
              {content}
            </MenuLink>
          );
          return <li key={item.key}>{row}</li>;
        })}
      </ul>
    </div>
  );
}
