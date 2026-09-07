"use client";

// MenuItemComponent.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { BasicMenuItem } from "./BasicMenuItem";
import { twMerge } from "tailwind-merge";
import { MenuItemType } from "../../types";
import { getClass, resolveIconComponent } from "../../utils";
import { DropdownProvider } from "@/components/ui/dropdown/useDropdown";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";

type MenuItemProps = {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  onClick?: () => void;
};

export const DropdownSubMenu: React.FC<MenuItemProps> = ({
  item,
  activeKey,
  setActiveKey,
  onClick,
}) => {
  const navigate = useRouter();
  const IconComponent = resolveIconComponent(item.iconName);

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
          <div
            role="menu"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }}
            className="flex items-center gap-2"
          >
            {IconComponent && <IconComponent />}
            <div>{item.title}</div>
          </div>
        </DropdownTrigger>
        <DropdownContent className="bg-white w-full">
          {item.children.map((child) => (
            <DropdownSubMenu
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
      <BasicMenuItem
        className="rounded-b-none"
        key={item.key}
        item={item}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
      />
    </div>
  );
};
