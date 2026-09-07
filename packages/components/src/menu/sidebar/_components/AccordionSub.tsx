import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { SidebarMenu } from "./SidebarMenu";

export interface AccordionSubProps extends MenuNavigationProps {
  item: MenuItemType;
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
  visible: boolean;
  color: ColorRole;
}

export function AccordionSub({ item, subVisible, setSubVisible, visible, color, onNavigate, currentPath }: AccordionSubProps) {
  if (!item.children) return null;

  return (
    <SidebarMenu
      data={item.children}
      setSubVisible={setSubVisible}
      visible={visible}
      color={color}
      onNavigate={onNavigate}
      currentPath={currentPath}
      className={cn("ml-2 overflow-auto transition-all duration-300 ease-in-out", visible && subVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}
    />
  );
}
