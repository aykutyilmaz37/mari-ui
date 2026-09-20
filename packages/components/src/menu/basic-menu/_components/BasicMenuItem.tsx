"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Button } from "../../../button";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass, getMenuListItemClass } from "../../utils";

export interface BasicMenuItemProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  className?: string;
  /** `"nav"` (varsayılan): üst yatay gezinme çubuğu satırı. `"list"`: bir dropdown/mega panelin İÇİNDEKİ dikey liste satırı — farklı bir hover/aktif görsel dili kullanır (bkz. `menu/utils.ts`). */
  variant?: "nav" | "list";
}

export function BasicMenuItem({ item, activeKey, setActiveKey, color, onNavigate, className, variant = "nav" }: BasicMenuItemProps) {
  const handleClick = () => {
    if (item.disabled || !item.route) return;
    setActiveKey(item.key);
    if (onNavigate) onNavigate(item.route);
    else window.location.href = item.route;
  };

  // Faz 13.5 kullanıcı bulgusu: Button'a renk/variant hiç verilmiyordu, bu
  // yüzden VARSAYILANI (solid + primary) kullanıyordu — bir gezinme çubuğunda
  // HER öğe koyu mavi, dolgun bir buton gibi görünüyordu (gerçek navbar'larda
  // öğeler düz metin/ghost olur, sadece aktif olan vurgulanır). `variant="ghost"
  // color="neutral"` ile düzeltildi; aktif vurgu `getItemClass`ten geliyor.
  const itemClass = variant === "list" ? getMenuListItemClass(item, activeKey, color) : getItemClass(item, activeKey, color);

  return (
    <div>
      <Button
        size={variant === "list" ? "md" : "lg"}
        variant="ghost"
        color="neutral"
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          "w-full text-sm transition justify-start",
          variant === "list" ? "px-2 py-1.5 rounded-md" : "px-3 py-2",
          item.disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
          !item.disabled && itemClass
        )}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          <div>{item.title}</div>
        </div>
      </Button>
    </div>
  );
}
