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
  /** Sağ tarafta gösterilecek keyfi içerik (örn. "Giriş Yap" düğmesi, sepet ikonu, arama). */
  actions?: React.ReactNode;
}

/**
 * Faz 13.5 kullanıcı bulgusu: BasicMenu'deki aynı yapısal sorun — logo ve
 * öğeler tek bir flex satırında yan yanaydı, hiç `padding` yoktu, "logo sol
 * sabit + eylem alanı sağ sabit" gibi bir gerçek navbar düzeni kurulamıyordu.
 */
export function MegaMenu({ data, logo, onLogoClick, menuItemPosition = "center", menuPosition = "default", color = "primary", onNavigate, actions }: MegaMenuProps) {
  const [visible, setVisible] = useState(false);
  const [subItem, setSubItem] = useState<MenuItemType[] | undefined>();

  return (
    <div className={cn("relative", getMenuPosition(menuPosition))}>
      <div className="flex flex-row items-center justify-between gap-4 bg-mari-surface px-4 py-3 shadow-md">
        {logo ? (
          <button type="button" className="shrink-0 cursor-pointer" onClick={onLogoClick}>
            {logo}
          </button>
        ) : (
          <span />
        )}

        <div className={cn("flex flex-1 flex-row items-center", getMenuItemJustify(menuItemPosition))}>
          {data.map((menu) => (
            <MegaMenuItem key={menu.key} item={menu} visible={visible} subKey={subItem?.[0]?.key} setVisible={setVisible} setSubItem={setSubItem} color={color} onNavigate={onNavigate} />
          ))}
        </div>

        {actions && <div className="flex shrink-0 flex-row items-center gap-3">{actions}</div>}
      </div>
      <div className={cn("transition-all duration-300 origin-top transform", visible ? "opacity-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none")}>
        {subItem && <MegaSubMenu subItem={subItem} setVisible={setVisible} setSubItem={setSubItem} color={color} onNavigate={onNavigate} />}
      </div>
    </div>
  );
}
