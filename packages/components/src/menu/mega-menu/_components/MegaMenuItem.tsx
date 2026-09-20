"use client";

import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Button } from "../../../button";
import { getItemClass } from "../../utils";
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

export function MegaMenuItem({ item, className, setVisible, visible, setSubItem, subKey, color, onNavigate }: MegaMenuItemProps) {
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

  const openSubmenu = () => {
    setVisible(true);
    setSubItem(item.children && item.children.length > 0 ? item.children : undefined);
  };

  // Faz 13.5 kullanıcı bulgusu (round 2): "BasicMenu için söylediklerim
  // MegaMenu için de geçerli" — sarmalayıcı eskiden hover/açıkken
  // `bg-mari-surface-alt` (arka plan dolgusu) alıyordu, bu da BasicMenu'nün
  // artık kullanmadığı farklı bir görsel dildi ve ayrıca `color` primary'i
  // (üstteki `Button`da) arka plan/dolgu olarak değil sadece metin/alt çizgi
  // rengi olarak kullanma kuralıyla tutarsızdı. Artık BasicMenu'yle AYNI
  // `getItemClass` (jitter'sız, rezerve edilmiş `border-b-2`, hover/aktifte
  // sadece renk değişimi) kullanılıyor.
  return (
    <div className="h-full" onMouseEnter={openSubmenu} onMouseLeave={() => setVisible(false)} onFocus={openSubmenu} onBlur={() => setVisible(false)}>
      <Button
        size="lg"
        variant="ghost"
        color="neutral"
        disabled={item.disabled}
        onClick={handleClick}
        className={cn(
          "h-full w-full px-3 text-sm transition justify-start",
          item.disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
          !item.disabled && getItemClass(item, isActive ? item.key : null, color)
        )}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          <div>{item.title}</div>
          {item.children && <ChevronDownIcon className={cn("transition-transform duration-200", isActive && "rotate-180")} size={16} />}
        </div>
      </Button>
    </div>
  );
}
