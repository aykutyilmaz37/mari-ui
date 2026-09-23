"use client";

import React, { useEffect, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Button } from "../../../button";
import type { MenuItemType, MenuNavigationProps, SidebarPosition } from "../../types";
import { getMenuVerticalItemClass, isMenuItemActive, navigateTo } from "../../utils";
import { AccordionSub } from "./AccordionSub";
import { DropdownSub } from "./DropdownSub";

export interface SidebarItemProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (value: string) => void;
  dropdown?: boolean;
  mega?: boolean;
  setSubItem?: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  setSubVisible: (value: boolean) => void;
  visible: boolean;
  position?: SidebarPosition;
  color: ColorRole;
}

export function SidebarItem({ item, activeKey, setActiveKey, dropdown, mega, setSubItem, setSubVisible, visible, position, color, onNavigate, currentPath }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeClass = getMenuVerticalItemClass(item, activeKey, color);

  useEffect(() => {
    if (item.children) setIsOpen(isMenuItemActive(item, activeKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const handleNavigateRoute = () => {
    if (!item.route) return;
    navigateTo(item.route, onNavigate);
    setActiveKey(item.key);
  };

  // `mega`/`dropdown` modlarında alt panel eskiden SADECE mouse hover ile
  // açılıyordu (Faz 13.5 bulgusu) — Button gerçek bir <button> olduğundan
  // aynı handler'lar `onFocus`/`onBlur`a da bağlanarak klavye kullanıcıları
  // için eşdeğeri sağlanıyor.
  const handleMouseEnter = () => {
    if (mega) setSubVisible(true);
    if (dropdown) setIsOpen(true);
    if (mega) setSubItem?.(item.children && item.children.length > 0 ? item.children : undefined);
  };
  const handleMouseLeave = () => {
    if (mega) setSubVisible(false);
    if (dropdown) setIsOpen(false);
  };

  const handleClick = () => {
    if (item.disabled) return;
    if (!mega && !dropdown && item.children && item.children.length > 0) {
      setIsOpen((prev) => !prev);
      return;
    }
    handleNavigateRoute();
  };

  return (
    <li className={cn("cursor-pointer transition-all ease-in-out duration-300", activeClass)}>
      {/* Faz 13.5 kullanıcı bulgusu: BasicMenuItem/MegaMenuItem'daki aynı bug
          — renk/variant verilmediği için Button varsayılanı (solid + primary)
          kullanıyordu, HER sidebar öğesi (aktif olsun olmasın) koyu mavi bir
          buton gibi görünüyordu. */}
      <Button
        size="lg"
        variant="ghost"
        color="neutral"
        disabled={item.disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={cn("w-full justify-start overflow-hidden px-3 rounded-lg", item.disabled ? "cursor-not-allowed" : "cursor-pointer", !item.disabled && activeClass)}
        htmlType="button"
        onClick={handleClick}
        icon={item.icon}
      >
        <div className="w-full flex items-center justify-between">
          <span className="ml-1 text-nowrap">{item.title}</span>
          {!dropdown && !mega && item.children && <ChevronRightIcon />}
        </div>
      </Button>
      {dropdown ? (
        <DropdownSub item={item} subVisible={isOpen} setSubVisible={setIsOpen} position={position} color={color} onNavigate={onNavigate} currentPath={currentPath} />
      ) : (
        <AccordionSub item={item} subVisible={isOpen} setSubVisible={setSubVisible} visible={visible} color={color} onNavigate={onNavigate} currentPath={currentPath} />
      )}
    </li>
  );
}
