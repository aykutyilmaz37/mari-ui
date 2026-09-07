"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Button } from "../../../button";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass } from "../../utils";

export interface BasicMenuItemProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  className?: string;
}

export function BasicMenuItem({ item, activeKey, setActiveKey, color, onNavigate, className }: BasicMenuItemProps) {
  const handleClick = () => {
    if (item.disabled || !item.route) return;
    setActiveKey(item.key);
    if (onNavigate) onNavigate(item.route);
    else window.location.href = item.route;
  };

  return (
    <div>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={item.disabled}
        className={cn("w-full px-3 py-2 transition justify-start", item.disabled ? "cursor-not-allowed" : "cursor-pointer", className, !item.disabled && getItemClass(item, activeKey, color))}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          <div>{item.title}</div>
        </div>
      </Button>
    </div>
  );
}
