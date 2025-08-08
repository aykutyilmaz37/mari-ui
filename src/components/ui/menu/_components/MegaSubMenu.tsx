import React from "react";
import { MenuItemType } from "../types";
import { Card } from "../../card";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { resolveIconComponent } from "../utils";

type MegaSubMenuProps = {
  subItem?: MenuItemType[];
  visible: boolean;
  setVisible: (val: boolean) => void;
  setSubItem: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
};
export const MegaSubMenu: React.FC<MegaSubMenuProps> = ({
  subItem,
  visible,
  setVisible,
  setSubItem,
}) => {
  const navigate = useRouter();

  const handleMouseEnter = () => {
    setVisible(true);
  };
  const handleMouseLeave = () => {
    setVisible(false);
    setSubItem(undefined);
  };

  return (
    <div
      role="menu"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setVisible(false);
          setSubItem(undefined);
        }
      }}
      className={twMerge(
        "absolute grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center left-0 top-full z-50 w-full py-8 px-24 bg-secondary-light transition-all duration-300 origin-top transform",
        visible
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      )}
    >
      {subItem?.map((subMenuItem) => {
        const IconComponent = resolveIconComponent(subMenuItem.iconName);

        return (
          <Card
            className="flex flex-col w-full group hover:scale-101 transition-all duration-500"
            key={subMenuItem.key}
            onClick={() => navigate.push(subMenuItem.route ?? "/")}
          >
            <span className="flex items-center gap-4 text-lg text-primary group-hover:text-info transition-all duration-500">
              {IconComponent && <IconComponent />} {subMenuItem.title}
            </span>
            <span className="text-sm text-secondary group-hover:text-info transition-all duration-500">
              {subMenuItem.description}
            </span>{" "}
          </Card>
        );
      })}
    </div>
  );
};
