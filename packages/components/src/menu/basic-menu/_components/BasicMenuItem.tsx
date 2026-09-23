"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass, navigateTo } from "../../utils";

export interface BasicMenuItemProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  className?: string;
}

/**
 * Navbar'ın alt menüsüz öğesi. `DropdownSubMenu`nün tetikleyicisiyle AYNI kutu
 * (`px-3 py-2 text-sm`) ve aynı alt gösterge (`getItemClass`) — iki tür öğe
 * yan yana aynı hizada ve aynı yükseklikte durur.
 */
export function BasicMenuItem({ item, activeKey, setActiveKey, color, onNavigate, className }: BasicMenuItemProps) {
  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={() => {
        if (item.disabled || !item.route) return;
        setActiveKey(item.key);
        navigateTo(item.route, onNavigate);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        item.disabled ? "cursor-not-allowed opacity-50" : cn("cursor-pointer", getItemClass(item, activeKey, color)),
        className
      )}
    >
      {item.icon}
      {item.title}
    </button>
  );
}
