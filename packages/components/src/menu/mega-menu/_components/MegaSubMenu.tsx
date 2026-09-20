"use client";

import React, { useEffect } from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Card } from "../../../card";
import { textClass } from "../../../lib/colorClasses";
import type { MenuItemType, MenuNavigationProps } from "../../types";

export interface MegaSubMenuProps extends MenuNavigationProps {
  subItem?: MenuItemType[];
  setVisible: (val: boolean) => void;
  setSubItem: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  color: ColorRole;
}

/**
 * Faz 13.5 bulgusu: sarmalayıcı `role="menu"` + `tabIndex={0}` taşıyordu
 * ama içerik gerçek `menuitem`ler değil, keyfi `Card`lar (bkz.
 * `DropdownContent`teki aynı gerekçe) — ikisi de kaldırıldı. Escape ile
 * kapatma artık odak bu panelin içinde olmasa bile çalışsın diye document
 * seviyesinde dinleniyor (eskiden panel elemanının kendisi odaklanmış
 * OLMALIYDI, ki `tabIndex={0}` dışında bunu sağlayan hiçbir şey yoktu).
 */
export function MegaSubMenu({ subItem, setVisible, setSubItem, color, onNavigate }: MegaSubMenuProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
        setSubItem(undefined);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setVisible, setSubItem]);

  return (
    <div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => {
        setVisible(false);
        setSubItem(undefined);
      }}
      className="absolute grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center left-0 top-full z-mari-dropdown w-full py-8 px-24 bg-mari-surface-alt"
    >
      {subItem?.map((subMenuItem) => (
        <Card
          key={subMenuItem.key}
          className="flex flex-col w-full group hover:scale-101 transition-all duration-500"
          onClick={() => {
            const route = subMenuItem.route ?? "/";
            if (onNavigate) onNavigate(route);
            else window.location.href = route;
          }}
        >
          <span className={cn("flex items-center gap-4 text-lg transition-all duration-500", textClass[color])}>
            {subMenuItem.icon} {subMenuItem.title}
          </span>
          <span className="text-sm text-mari-muted transition-all duration-500">{subMenuItem.description}</span>
        </Card>
      ))}
    </div>
  );
}
