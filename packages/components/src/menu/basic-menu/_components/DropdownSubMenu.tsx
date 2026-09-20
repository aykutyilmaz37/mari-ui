"use client";

import React from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../../dropdown";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass, getMenuListItemClass } from "../../utils";
import { BasicMenuItem } from "./BasicMenuItem";

export interface DropdownSubMenuProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  onItemClick?: () => void;
  /**
   * `true` ise bu öğe bir dropdown panelin İÇİNDE (bir başka `DropdownSubMenu`nun
   * çocuğu olarak) render ediliyor demektir — üst navbar satırı DEĞİL, dikey
   * bir liste satırı. Faz 13.5 kullanıcı bulgusu (round 2): eskiden iç içe
   * alt menüler de üst navbar'la AYNI "alt çizgi" stilini kullanıyordu, bu da
   * bir dropdown panelinin içinde saçma/"hala tab gibi" görünüyordu — artık
   * `getMenuListItemClass` (yumuşak arka plan dolgusu) kullanıyor.
   */
  nested?: boolean;
}

/** `Dropdown` kendi Provider'ını içinde barındırıyor — eskiden burada da
 * AYRICA bir `<DropdownProvider>` sarmalayıcısı vardı, gereksizdi. */
export function DropdownSubMenu({ item, activeKey, setActiveKey, color, onNavigate, currentPath, onItemClick, nested = false }: DropdownSubMenuProps) {
  if (!item.children) {
    return (
      <div className="flex flex-col gap-1">
        <BasicMenuItem variant={nested ? "list" : "nav"} item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />
      </div>
    );
  }

  const triggerClass = nested ? getMenuListItemClass(item, activeKey, color) : getItemClass(item, activeKey, color);

  return (
    <Dropdown hover className="block self-auto">
      <DropdownTrigger
        className={cn(
          "w-full cursor-pointer text-sm transition justify-start flex items-center gap-2",
          nested ? "px-2 py-1.5 rounded-md" : "px-3 py-2",
          triggerClass
        )}
        onClick={() => onItemClick?.()}
      >
        {item.icon}
        <div className="flex-1">{item.title}</div>
        {nested && <ChevronRightIcon size={16} className="text-mari-muted" />}
      </DropdownTrigger>
      {/* Faz 13.5 kullanıcı bulgusu: `w-full` eskiden `DropdownContent`in
          `position: absolute` olduğu dönemde tetikleyicinin `relative`
          kutusuna göre makul bir genişlik veriyordu — panel artık
          `position: fixed` olduğundan (Dropdown'daki kırpma düzeltmesi,
          bkz. dropdown/_components/DropdownContent.tsx) `w-full` VIEWPORT'UN
          TAMAMI anlamına geliyordu, panel yarı yarıya ekranın dışına taşıp
          sol kenarda kırpılmış gibi görünüyordu. Sabit bir genişliğe çevrildi. */}
      <DropdownContent placement={nested ? "right" : "bottom"} className="w-56 p-1.5">
        {item.children.map((child) => (
          <DropdownSubMenu
            key={child.key}
            item={child}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            color={color}
            onNavigate={onNavigate}
            currentPath={currentPath}
            nested
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
