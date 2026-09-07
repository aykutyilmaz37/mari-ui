"use client";

import React, { useEffect, useState } from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemType, MenuNavigationProps, SidebarPosition } from "../../types";
import { findActiveKeyByRoute } from "../../utils";
import { SidebarItem } from "./SidebarItem";

export interface SidebarMenuProps extends MenuNavigationProps {
  data: MenuItemType[];
  className?: string;
  setSubItem?: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  /** Eskiden zorunluydu, ama `DropdownSub`'ın kendi çağrısı bunu HİÇ
   * geçmiyordu — gerçek bir TS hatasıydı (bkz. plan denetimi). Bu
   * bağlamda "görünürlük" kavramı anlamlı olmadığı için artık opsiyonel. */
  setSubVisible?: (value: boolean) => void;
  visible?: boolean;
  mega?: boolean;
  dropdown?: boolean;
  position?: SidebarPosition;
  color?: ColorRole;
}

export function SidebarMenu({ data, className, setSubItem, setSubVisible, visible = true, mega, dropdown, position, color = "primary", onNavigate, currentPath }: SidebarMenuProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveKey(findActiveKeyByRoute(data, currentPath));
  }, [currentPath, data]);

  return (
    <ul className={cn(className)}>
      {data.map((item) => (
        <SidebarItem
          key={item.key}
          item={item}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          setSubItem={setSubItem}
          setSubVisible={setSubVisible ?? (() => {})}
          visible={visible}
          mega={mega}
          dropdown={dropdown}
          position={position}
          color={color}
          onNavigate={onNavigate}
          currentPath={currentPath}
        />
      ))}
    </ul>
  );
}
