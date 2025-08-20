import React from "react";
import { MenuItemType, SidebarPosition } from "../../types";
import { DropdownProvider } from "@/components/ui/dropdown/useDropdown";
import { Dropdown, DropdownContent } from "@/components/ui/dropdown";
import { SidebarMenu } from "./SidebarMenu";

type DropdownSubProps = {
  item: MenuItemType;
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
  position?: SidebarPosition;
};
export const DropdownSub: React.FC<DropdownSubProps> = ({
  item,
  setSubVisible,
  subVisible,
  position = 'left',
}) => {
  return (
    item.children && (
      <div
        role="menu"
        tabIndex={0}
        onMouseEnter={() => setSubVisible(true)}
        onMouseLeave={() => setSubVisible(false)}
      >
        <DropdownProvider>
          <Dropdown hover>
            <DropdownContent
              customVisible={subVisible}
              placement={position === "left" ? "right" : "left"}
              className="bg-white w-full"
            >
              <SidebarMenu
                data={item.children}
                dropdown
                setSubVisible={() => {}}
                position={position}
              />
            </DropdownContent>
          </Dropdown>
        </DropdownProvider>
      </div>
    )
  );
};
