"use client";

import React, { useState } from "react";
import { cn } from "@mari-ui/core";
import type { MenuColorProps, MenuItemJustify, MenuItemType, MenuNavigationProps, MenuPosition } from "../types";
import { getMenuItemJustify, getMenuPosition } from "../utils";
import { MegaMenuItem } from "./_components/MegaMenuItem";
import { MegaSubMenu } from "./_components/MegaSubMenu";

export interface MegaMenuProps extends MenuNavigationProps, MenuColorProps {
  data: MenuItemType[];
  logo?: React.ReactNode;
  onLogoClick?: () => void;
  menuItemPosition?: MenuItemJustify;
  menuPosition?: MenuPosition;
}

export function MegaMenu({ data, logo, onLogoClick, menuItemPosition = "center", menuPosition = "default", color = "primary", onNavigate }: MegaMenuProps) {
  const [visible, setVisible] = useState(false);
  const [subItem, setSubItem] = useState<MenuItemType[] | undefined>();

  return (
    <div className={cn("relative", getMenuPosition(menuPosition))}>
      <div className={cn("flex flex-row items-center bg-mari-surface shadow-md", getMenuItemJustify(menuItemPosition))}>
        {logo && (
          <button type="button" className="cursor-pointer" onClick={onLogoClick}>
            {logo}
          </button>
        )}
        {data.map((menu) => (
          <MegaMenuItem key={menu.key} item={menu} visible={visible} subKey={subItem?.[0]?.key} setVisible={setVisible} setSubItem={setSubItem} color={color} onNavigate={onNavigate} />
        ))}
      </div>
      <div className={cn("transition-all duration-300 origin-top transform", visible ? "opacity-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none")}>
        {subItem && <MegaSubMenu subItem={subItem} setVisible={setVisible} setSubItem={setSubItem} color={color} onNavigate={onNavigate} />}
      </div>
    </div>
  );
}
