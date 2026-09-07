"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Card } from "../../../card";
import { textClass } from "../../../lib/colorClasses";
import type { MenuItemType, MenuNavigationProps } from "../../types";

export interface MegaSubProps extends MenuNavigationProps {
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
  subItem: MenuItemType[];
  cardClassName?: string;
  color: ColorRole;
}

export function MegaSub({ setSubVisible, subVisible, subItem, cardClassName, color, onNavigate }: MegaSubProps) {
  return (
    <div
      role="menu"
      tabIndex={0}
      onMouseEnter={() => setSubVisible(true)}
      onMouseLeave={() => setSubVisible(false)}
      className={cn("bg-mari-surface-alt h-full overflow-hidden transition-all duration-300 ease-in-out", subVisible ? "w-full max-w-3xl opacity-100" : "w-0 opacity-0")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full w-full">
        {subItem.map((item) => (
          <Card
            key={item.key}
            className={cn("flex flex-col w-full group hover:scale-101 transition-all duration-500 h-72", cardClassName)}
            onClick={() => {
              const route = item.route ?? "/";
              if (onNavigate) onNavigate(route);
              else window.location.href = route;
            }}
          >
            <span className={cn("flex items-center gap-4 text-lg transition-all duration-500", textClass[color])}>
              {item.icon} {item.title}
            </span>
            <span className="text-sm text-mari-muted transition-all duration-500">{item.description}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
