"use client";

import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { textClass, textHoverClass } from "../../../lib/colorClasses";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { navigateTo } from "../../utils";

/** Bu sayıdan fazla leaf varsa gerisi "Daha Fazla Gör" arkasına saklanır (referanstaki aynı desen). */
const VISIBLE_LEAF_COUNT = 6;

export interface MegaPanelColumnProps extends MenuNavigationProps {
  /** Grup başlığı — seçili ray öğesinin bir çocuğu. `group.children` altındaki linkler olur. */
  group: MenuItemType;
  color: ColorRole;
  onItemClick?: (item: MenuItemType) => void;
}

/**
 * Bir bağlantı grubu: vurgu renginde başlık + altında yoğun bir link listesi.
 * Referans e-ticaret menülerinin YAPISI (başlık → linkler → "Daha Fazla Gör"),
 * görünüm kendi token'larımızdan. Linkler kasıtlı olarak "satır/pill" değil
 * düz metin bağlantıları: bir mega panelde onlarca öğe var, her birine hover
 * dolgusu vermek görsel gürültü yaratıyor — sadece renk değişiyor.
 */
export function MegaPanelColumn({ group, color, onNavigate, onItemClick }: MegaPanelColumnProps) {
  const [expanded, setExpanded] = useState(false);
  const leaves = group.children ?? [];
  const visibleLeaves = expanded ? leaves : leaves.slice(0, VISIBLE_LEAF_COUNT);
  const hasMore = leaves.length > VISIBLE_LEAF_COUNT;

  const handleClick = (item: MenuItemType) => {
    onItemClick?.(item);
    navigateTo(item.route, onNavigate);
  };

  return (
    <div className="mb-6 flex break-inside-avoid flex-col items-start gap-1.5">
      {group.route ? (
        <button type="button" onClick={() => handleClick(group)} className={cn("group/head flex cursor-pointer items-center gap-1 text-start text-sm font-semibold transition-colors", textClass[color])}>
          {group.title}
          <ChevronRightIcon aria-hidden="true" size={14} className="transition-transform duration-150 group-hover/head:translate-x-0.5" />
        </button>
      ) : (
        <div className={cn("text-sm font-semibold", textClass[color])}>{group.title}</div>
      )}

      {visibleLeaves.map((leaf) => (
        <button
          key={leaf.key}
          type="button"
          disabled={leaf.disabled}
          onClick={() => handleClick(leaf)}
          className={cn(
            "text-start text-sm leading-6 transition-colors duration-150",
            leaf.disabled ? "cursor-not-allowed text-mari-muted opacity-50" : cn("cursor-pointer text-mari-foreground/75", textHoverClass[color])
          )}
        >
          {leaf.title}
        </button>
      ))}

      {hasMore && (
        <button type="button" onClick={() => setExpanded((prev) => !prev)} className="mt-0.5 flex cursor-pointer items-center gap-1 whitespace-nowrap text-sm font-medium text-mari-foreground underline underline-offset-4 transition-colors hover:text-mari-muted">
          {expanded ? "Daha Az Göster" : "Daha Fazla Gör"}
          <ChevronDownIcon aria-hidden="true" size={14} className={cn("transition-transform duration-200", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}
