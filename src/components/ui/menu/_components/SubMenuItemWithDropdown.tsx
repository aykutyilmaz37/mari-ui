// MenuItemComponent.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { MenuItemType } from "../types";
import { iconMap } from "../mockIconData";
import { DropdownProvider } from "../../dropdown/useDropdown";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../dropdown";
import { MenuItem } from "./MenuItem";
import { twMerge } from "tailwind-merge";
import { getClass } from "../utils";

type MenuItemProps = {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  onClick?: () => void;
};

export const SubMenuItemWithDropdown: React.FC<MenuItemProps> = ({
  item,
  activeKey,
  setActiveKey,
  onClick,
}) => {
  const navigate = useRouter();
  const IconComponent = item.iconName ? iconMap[item.iconName] : null;

  return item.children ? (
    <DropdownProvider>
      <Dropdown hover>
        <DropdownTrigger
          key={item.key}
          className={twMerge(
            "w-full cursor-pointer px-3 py-2 rounded-b-none transition justify-start flex items-center gap-2",
            getClass(item, activeKey)
          )}
        >
          <div onClick={onClick} className="flex items-center gap-2">
            {IconComponent && <IconComponent />}
            <div>{item.label}</div>
          </div>
        </DropdownTrigger>
        <DropdownContent className="bg-white w-full">
          {item.children.map((child) => (
            <SubMenuItemWithDropdown
              onClick={() => {
                if (child.route) navigate.push(child.route);
                setActiveKey(child.key);
              }}
              key={child.key}
              item={child}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
            />
          ))}
        </DropdownContent>
      </Dropdown>
    </DropdownProvider>
  ) : (
    <div className="flex flex-col gap-1">
      <MenuItem
        className="rounded-b-none"
        key={item.key}
        item={item}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
      />
    </div>
  );
};
