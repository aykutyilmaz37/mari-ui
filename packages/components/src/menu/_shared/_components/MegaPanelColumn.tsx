"use client";

import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { textClass, textHoverClass } from "../../../lib/colorClasses";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { MenuLink } from "../MenuLink";
import { NewTabHint } from "../../../lib/linkBehavior";

/** Bu sayıdan fazla leaf varsa gerisi "Daha Fazla Gör" arkasına saklanır (referanstaki aynı desen). */
const VISIBLE_LEAF_COUNT = 6;

export interface MegaPanelColumnProps extends MenuNavigationProps {
  /** Grup başlığı — seçili ray öğesinin bir çocuğu. `group.children` altındaki linkler olur. */
  group: MenuItemType;
  color: ColorRole;
  onItemClick?: (item: MenuItemType) => void;
  activeKey?: string | null;
}

/**
 * Bir bağlantı grubu: vurgu renginde başlık + altında yoğun bir link listesi.
 * Referans e-ticaret menülerinin YAPISI (başlık → linkler → "Daha Fazla Gör"),
 * görünüm kendi token'larımızdan. Linkler kasıtlı olarak "satır/pill" değil
 * düz metin bağlantıları: bir mega panelde onlarca öğe var, her birine hover
 * dolgusu vermek görsel gürültü yaratıyor — sadece renk değişiyor.
 */
export function MegaPanelColumn({ group, color, onNavigate, onItemClick, activeKey = null }: Readonly<MegaPanelColumnProps>) {
  const leaves = group.children ?? [];
  // Geçerli sayfa "Daha Fazla Gör" arkasında kalıyorsa kolon açık başlar — aktif link gizlenmesin.
  const [expanded, setExpanded] = useState(() => leaves.slice(VISIBLE_LEAF_COUNT).some((leaf) => leaf.key === activeKey));
  const visibleLeaves = expanded ? leaves : leaves.slice(0, VISIBLE_LEAF_COUNT);
  const hasMore = leaves.length > VISIBLE_LEAF_COUNT;


  return (
    <div className="mb-6 flex break-inside-avoid flex-col items-start gap-1.5">
      {group.route ? (
        <MenuLink
          route={group.route}
          target={group.target}
          reloadDocument={group.reloadDocument}
          onNavigate={onNavigate}
          current={group.key === activeKey}
          onSelect={() => onItemClick?.(group)}
          className={cn("group/head flex cursor-pointer items-center gap-1 rounded-sm text-start text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring", textClass[color])}
        >
          {group.title}
          <NewTabHint target={group.target} />
          <ChevronRightIcon aria-hidden="true" size={14} className="transition-transform duration-150 group-hover/head:translate-x-0.5" />
        </MenuLink>
      ) : (
        <div className={cn("text-sm font-semibold", textClass[color])}>{group.title}</div>
      )}

      {visibleLeaves.map((leaf) => (
        <MenuLink
          key={leaf.key}
          route={leaf.route}
          target={leaf.target}
          reloadDocument={leaf.reloadDocument}
          onNavigate={onNavigate}
          disabled={leaf.disabled}
          current={leaf.key === activeKey}
          onSelect={() => onItemClick?.(leaf)}
          className={cn(
            "inline-flex items-center gap-1 rounded-sm text-start text-sm leading-6 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
            leaf.disabled && "cursor-not-allowed text-mari-muted opacity-50",
            !leaf.disabled && leaf.key === activeKey && cn("cursor-pointer font-medium", textClass[color]),
            !leaf.disabled && leaf.key !== activeKey && cn("cursor-pointer text-mari-foreground/75", textHoverClass[color])
          )}
        >
          {leaf.title}
          <NewTabHint target={leaf.target} />
        </MenuLink>
      ))}

      {hasMore && (
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded((prev) => !prev)} className="mt-0.5 flex cursor-pointer items-center gap-1 whitespace-nowrap text-sm font-medium text-mari-foreground underline underline-offset-4 transition-colors hover:text-mari-muted">
          {expanded ? "Daha Az Göster" : "Daha Fazla Gör"}
          <ChevronDownIcon aria-hidden="true" size={14} className={cn("transition-transform duration-200", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}
