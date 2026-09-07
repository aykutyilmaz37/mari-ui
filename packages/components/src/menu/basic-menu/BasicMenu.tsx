"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@mari-ui/core";
import type { MenuItemJustify, MenuItemType, MenuNavigationProps, MenuPosition, MenuColorProps } from "../types";
import { getMenuItemJustify, getMenuPosition } from "../utils";
import { BasicMenuItem } from "./_components/BasicMenuItem";
import { DropdownSubMenu } from "./_components/DropdownSubMenu";

export interface BasicMenuProps extends MenuNavigationProps, MenuColorProps {
  data: MenuItemType[];
  logo?: React.ReactNode;
  onLogoClick?: () => void;
  menuItemJustify?: MenuItemJustify;
  menuPosition?: MenuPosition;
}

export function BasicMenu({ data, logo, onLogoClick, menuItemJustify = "left", menuPosition = "default", color = "primary", onNavigate, currentPath }: BasicMenuProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (data.length > 0 && !activeKey) {
      setActiveKey(data[0]?.key ?? null);
    }
  }, [data, activeKey]);

  return (
    <div className={cn("flex flex-row gap-4 items-center bg-mari-surface shadow-md", getMenuPosition(menuPosition), getMenuItemJustify(menuItemJustify))}>
      {logo && (
        <button type="button" className="cursor-pointer" onClick={onLogoClick}>
          {logo}
        </button>
      )}
      {data.map((item) =>
        item.children ? (
          <DropdownSubMenu key={item.key} item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} currentPath={currentPath} />
        ) : (
          <BasicMenuItem key={item.key} item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />
        )
      )}
    </div>
  );
}
