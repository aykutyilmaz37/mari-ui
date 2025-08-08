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
    if (item.route) {
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
        className={twMerge(
          "w-full cursor-pointer px-3 py-2 transition justify-start",
          className,
          getClass(item, activeKey)
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
