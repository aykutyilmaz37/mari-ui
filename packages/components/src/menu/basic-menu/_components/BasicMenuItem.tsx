"use client";

// MenuItemComponent.tsx
import React from "react";
import { useRouter } from "next/navigation";

import { twMerge } from "tailwind-merge";
import { MenuItemType } from "../../types";
import { getClass, resolveIconComponent } from "../../utils";
import { Button } from "@/components/ui/button";

type MenuItemProps = {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  className?: string;
};

export const BasicMenuItem: React.FC<MenuItemProps> = ({
  item,
  activeKey,
  setActiveKey,
  className,
}) => {
  const navigate = useRouter();
  const IconComponent = resolveIconComponent(item.iconName);

  const handleClick = (item: MenuItemType) => {
    if (!item.disabled && item.route) {
      navigate.push(item.route);
      setActiveKey(item.key);
    }
  };


  return (
    <div>
      <Button
        size="large"
        key={item.key}
        onClick={() => handleClick(item)}
        disabled={item.disabled}
        className={twMerge(
          "w-full px-3 py-2 transition justify-start",
          item.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          className,
          !item.disabled && getClass(item, activeKey)
        )}
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent />}
          <div>{item.title}</div>
        </div>
      </Button>
    </div>
  );
};
