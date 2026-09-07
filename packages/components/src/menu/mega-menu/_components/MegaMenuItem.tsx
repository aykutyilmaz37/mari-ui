"use client";

import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Button } from "../../../button";
import type { MenuItemType, MenuNavigationProps } from "../../types";

export interface MegaMenuItemProps extends MenuNavigationProps {
  item: MenuItemType;
  className?: string;
  visible: boolean;
  setVisible: (val: boolean) => void;
  setSubItem: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  subKey: string | undefined;
  color: ColorRole;
}

export function MegaMenuItem({ item, className, setVisible, visible, setSubItem, subKey, onNavigate }: MegaMenuItemProps) {
  // Eskiden `subKey?.slice(0, 1) === item.key` idi — bu, subKey'in SADECE
  // İLK KARAKTERİNİ item.key'in TAMAMIYLA karşılaştırıyordu. Anahtarlar tek
  // karakter olmadıkça bu karşılaştırma neredeyse hiç eşleşmezdi (gerçek
  // bir mantık hatası). Muhtemel niyet "alt öğe anahtarı üst öğe anahtarıyla
  // başlıyor mu" idi — `startsWith` ile düzeltildi.
  const isActive = Boolean(subKey?.startsWith(item.key)) && visible;

  const handleClick = () => {
    if (item.disabled || !item.route) return;
    if (onNavigate) onNavigate(item.route);
    else window.location.href = item.route;
  };

  return (
    <div
      role="menuitem"
      tabIndex={0}
      className={cn("hover:bg-mari-surface-alt h-full", isActive && "bg-mari-surface-alt")}
      onMouseEnter={() => {
        setVisible(true);
        setSubItem(item.children && item.children.length > 0 ? item.children : undefined);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      <Button
        size="lg"
        disabled={item.disabled}
        onClick={handleClick}
        className={cn("w-full px-3 p-4 transition justify-start", item.disabled ? "cursor-not-allowed" : "cursor-pointer", className)}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          <div>{item.title}</div>
          {item.children && <ChevronDownIcon className={cn("transition-transform duration-200", isActive && "rotate-180")} size={24} />}
        </div>
      </Button>
    </div>
  );
}
