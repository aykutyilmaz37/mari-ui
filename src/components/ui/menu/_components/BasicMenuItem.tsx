// MenuItemComponent.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { MenuItemType } from "../types";
import { Button } from "../../button";
import { twMerge } from "tailwind-merge";
import { getClass, resolveIconComponent } from "../utils";

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

  console.log(item);

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
