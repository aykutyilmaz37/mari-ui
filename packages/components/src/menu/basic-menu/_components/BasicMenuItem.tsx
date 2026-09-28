"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass } from "../../utils";
import { touchTargetClass } from "../../../lib/sizeClasses";
import { MenuLink } from "../../_shared/MenuLink";

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
 * yan yana aynı hizada ve aynı yükseklikte durur. Route'u olan öğe gerçek bir
 * link (`MenuLink`), geçerli sayfa `aria-current="page"` taşır.
 */
export function BasicMenuItem({ item, activeKey, setActiveKey, color, onNavigate, className }: BasicMenuItemProps) {
  return (
    <MenuLink
      route={item.route}
      onNavigate={onNavigate}
      disabled={item.disabled}
      current={item.key === activeKey}
      onSelect={() => setActiveKey(item.key)}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        touchTargetClass.md,
        item.disabled ? "cursor-not-allowed opacity-50" : cn("cursor-pointer", getItemClass(item, activeKey, color)),
        className
      )}
    >
      {item.icon}
      {item.title}
    </MenuLink>
  );
}
