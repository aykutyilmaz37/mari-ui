"use client";

import React from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { textClass } from "../../../lib/colorClasses";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { navigateTo } from "../../utils";

/** Seçili satırın sol şeridi — literal tablo (Tailwind birleştirilmiş sınıf adını taramaz). */
const INDICATOR_COLOR_CLASS: Record<ColorRole, string> = {
  primary: "before:bg-mari-primary",
  accent: "before:bg-mari-accent",
  success: "before:bg-mari-success",
  error: "before:bg-mari-error",
  warning: "before:bg-mari-warning",
  info: "before:bg-mari-info",
  neutral: "before:bg-mari-neutral",
};

export interface MegaPanelRailProps extends MenuNavigationProps {
  items: MenuItemType[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  color: ColorRole;
  orientation: "horizontal" | "vertical";
  onItemClick?: (item: MenuItemType) => void;
}

/**
 * Kategori rayı: hover VEYA klavye focus'u ile seçili öğeyi değiştirir (Tab
 * kullanıcıları da kolonları görebilsin diye — mouse'a özel bırakılmadı).
 *
 * Referans e-ticaret menülerinin YAPISI: seçili satır vurgu rengine döner,
 * sol kenarında rengin kendisinden 2px'lik bir şerit taşır ve satırın sağ
 * ucundaki chevron "burada devamı var" der. Renkler kendi token'larımızdan —
 * referansın turuncusu kopyalanmadı.
 *
 * Şerit bir `border-l` DEĞİL ayrı bir `::before` çubuğu: kenarlık, satırın
 * `rounded-md` köşelerini takip edip uçlarından bükülüyordu (kullanıcı
 * bulgusu — navbar alt çizgisindeki radius sorununun aynısı).
 *
 * `orientation="vertical"` (Sidebar'ın dar yan panelleri) ray'i üstte yatay
 * bir şerit hâline getirir; orada sol şerit/ayraç yerine altta bir ayraç olur.
 */
export function MegaPanelRail({ items, selectedKey, onSelect, color, orientation, onNavigate, onItemClick }: MegaPanelRailProps) {
  if (items.length === 0) return null;

  const horizontal = orientation === "horizontal";

  return (
    <ul className={cn("flex shrink-0", horizontal ? "w-52 flex-col xl:w-60 gap-0.5 border-r border-mari-border pr-3" : "flex-row flex-wrap gap-1 border-b border-mari-border pb-2")}>
      {items.map((item) => {
        const selected = item.key === selectedKey;
        const indicatorClass = selected ? INDICATOR_COLOR_CLASS[color] : "before:bg-transparent";
        return (
          <li key={item.key}>
            <button
              type="button"
              disabled={item.disabled}
              onMouseEnter={() => !item.disabled && onSelect(item.key)}
              onFocus={() => !item.disabled && onSelect(item.key)}
              onClick={() => {
                if (item.disabled) return;
                onItemClick?.(item);
                navigateTo(item.route, onNavigate);
              }}
              className={cn(
                "relative flex w-full items-center gap-2 rounded-md py-2 text-start text-sm transition-colors duration-150",
                horizontal
                  ? cn(
                      "pr-2 pl-3",
                      // Düz (yuvarlatılmamış) sol şerit — sadece seçiliyken görünür.
                      "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:content-['']",
                      indicatorClass
                    )
                  : "px-3",
                item.disabled && "cursor-not-allowed opacity-50",
                !item.disabled && "cursor-pointer",
                selected ? cn(textClass[color], "bg-mari-surface-alt font-medium") : "font-normal text-mari-foreground/80 hover:bg-mari-surface-alt"
              )}
            >
              {item.icon}
              <span className="flex-1 truncate">{item.title}</span>
              {horizontal && item.children && item.children.length > 0 && (
                <ChevronRightIcon aria-hidden="true" size={16} className={cn("shrink-0 transition-colors", selected ? textClass[color] : "text-mari-muted")} />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
