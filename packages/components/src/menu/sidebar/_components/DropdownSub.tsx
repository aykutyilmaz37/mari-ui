import React from "react";
import { type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent } from "../../../dropdown";
import type { MenuItemType, MenuNavigationProps, SidebarPosition } from "../../types";
import { SidebarMenu } from "./SidebarMenu";

export interface DropdownSubProps extends MenuNavigationProps {
  item: MenuItemType;
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
  position?: SidebarPosition;
  color: ColorRole;
}

/** `Dropdown` kendi Provider'ını içinde barındırıyor — eskiden burada da
 * AYRICA bir `<DropdownProvider>` sarmalayıcısı vardı, gereksizdi. */
export function DropdownSub({ item, setSubVisible, subVisible, position = "left", color, onNavigate, currentPath }: DropdownSubProps) {
  if (!item.children) return null;

  return (
    <div role="menu" tabIndex={0} onMouseEnter={() => setSubVisible(true)} onMouseLeave={() => setSubVisible(false)}>
      <Dropdown hover>
        <DropdownContent customVisible={subVisible} placement={position === "left" ? "right" : "left"} className="w-full">
          <SidebarMenu data={item.children} dropdown setSubVisible={() => {}} position={position} color={color} onNavigate={onNavigate} currentPath={currentPath} />
        </DropdownContent>
      </Dropdown>
    </div>
  );
}
