"use client";

import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { getItemClass, navigateTo } from "../../utils";
import type { MenuItemType, MenuNavigationProps } from "../../types";

export interface MegaMenuItemProps extends MenuNavigationProps {
  item: MenuItemType;
  className?: string;
  visible: boolean;
  /** Bu öğenin alt panelini açar (hover/focus). Bekleyen gecikmeli kapatmayı da iptal eder — bkz. `MegaMenu`. */
  onOpen: (children: MenuItemType[] | undefined) => void;
  /** Kapatmayı GECİKMELİ planlar: fare/odak panele geçerken menü kapanmasın. */
  onClose: () => void;
  subKey: string | undefined;
  color: ColorRole;
}

export function MegaMenuItem({ item, className, onOpen, onClose, visible, subKey, color, onNavigate }: MegaMenuItemProps) {
  // Eskiden `subKey?.slice(0, 1) === item.key` idi — bu, subKey'in SADECE
  // İLK KARAKTERİNİ item.key'in TAMAMIYLA karşılaştırıyordu. Anahtarlar tek
  // karakter olmadıkça bu karşılaştırma neredeyse hiç eşleşmezdi (gerçek
  // bir mantık hatası). Muhtemel niyet "alt öğe anahtarı üst öğe anahtarıyla
  // başlıyor mu" idi — `startsWith` ile düzeltildi.
  const isActive = Boolean(subKey?.startsWith(item.key)) && visible;

  const handleClick = () => {
    if (item.disabled) return;
    navigateTo(item.route, onNavigate);
  };

  const openSubmenu = () => onOpen(item.children);
  // Paneli açık olan üst öğe "aktif" gösterilir — gerçek bir route eşleşmesi değil, açık/kapalı durumu.
  const activeKey = isActive ? item.key : null;
  const stateClass = item.disabled ? "cursor-not-allowed opacity-50" : cn("cursor-pointer", getItemClass(item, activeKey, color));

  // Kullanıcı bulgusu (2026-09-22): öğe `Button variant="ghost"` idi ve
  // `ghost`a eklenen hover dolgusu burada tetikleyicinin TAMAMINI kaplayan,
  // alt göstergeden çok daha geniş bir şerit yaratıyordu. Navbar öğesi bir
  // "buton" gibi görünmemeli — BasicMenuItem'ın aynısı: düz `<button>`,
  // arka plan yok, sadece metin rengi + alt gösterge değişiyor.
  return (
    <div className="flex h-full items-center" onMouseEnter={openSubmenu} onMouseLeave={onClose} onFocus={openSubmenu} onBlur={onClose}>
      <button
        type="button"
        disabled={item.disabled}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          stateClass,
          className
        )}
      >
        {item.icon}
        {item.title}
        {item.children && <ChevronDownIcon aria-hidden="true" size={14} className={cn("opacity-60 transition-transform duration-200", isActive && "rotate-180")} />}
      </button>
    </div>
  );
}
