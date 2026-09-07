"use client";

import React from "react";
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

export function MegaSubMenu({ subItem, setVisible, setSubItem, color, onNavigate }: MegaSubMenuProps) {
  return (
    <div
      role="menu"
      tabIndex={0}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => {
        setVisible(false);
        setSubItem(undefined);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setVisible(false);
          setSubItem(undefined);
        }
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
