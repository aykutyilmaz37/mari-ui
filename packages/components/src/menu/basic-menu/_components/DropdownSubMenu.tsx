"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../../dropdown";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass } from "../../utils";
import { BasicMenuItem } from "./BasicMenuItem";

export interface DropdownSubMenuProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  onItemClick?: () => void;
}

/** `Dropdown` artık kendi `DropdownProvider`ını içinde barındırıyor — eskiden
 * burada AYRICA bir `<DropdownProvider>` sarmalayıcısı vardı, gereksizdi. */
export function DropdownSubMenu({ item, activeKey, setActiveKey, color, onNavigate, currentPath, onItemClick }: DropdownSubMenuProps) {
  if (!item.children) {
    return (
      <div className="flex flex-col gap-1">
        <BasicMenuItem className="rounded-b-none" item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <Dropdown hover>
      <DropdownTrigger className={cn("w-full cursor-pointer px-3 py-2 rounded-b-none transition justify-start flex items-center gap-2", getItemClass(item, activeKey, color))}>
        <div
          role="menuitem"
          tabIndex={0}
          onClick={onItemClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onItemClick?.();
            }
          }}
          className="flex items-center gap-2"
        >
          {item.icon}
          <div>{item.title}</div>
        </div>
      </DropdownTrigger>
      <DropdownContent className="w-full">
        {item.children.map((child) => (
          <DropdownSubMenu
            key={child.key}
            item={child}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            color={color}
            onNavigate={onNavigate}
            currentPath={currentPath}
            onItemClick={() => {
              if (child.route) {
                if (onNavigate) onNavigate(child.route);
                else window.location.href = child.route;
              }
              setActiveKey(child.key);
            }}
          />
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
