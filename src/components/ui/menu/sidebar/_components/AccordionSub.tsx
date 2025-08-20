import React from "react";
import { SidebarMenu } from "./SidebarMenu";
import { MenuItemType } from "../../types";
import { twMerge } from "tailwind-merge";

type AccordionSubProps = {
  item: MenuItemType;
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
};
export const AccordionSub: React.FC<AccordionSubProps> = ({
  item,
  subVisible,
  setSubVisible,
}) => {
  return (
    item.children && (
      <SidebarMenu
        data={item.children}
        setSubVisible={setSubVisible}
        className={twMerge(
          "ml-2 overflow-auto transition-all duration-300 ease-in-out",
          subVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      />
    )
  );
};
