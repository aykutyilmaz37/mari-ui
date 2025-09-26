import React from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "lucide-react";
import { MenuItemType } from "../../types";
import { resolveIconComponent } from "../../utils";
import { Button } from "@/components/ui/button";

type MegaMenuItemProps = {
  item: MenuItemType;
  className?: string;
  visible: boolean;
  setVisible: (val: boolean) => void;
  setSubItem: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  subKey: string | undefined;
};

export const MegaMenuItem: React.FC<MegaMenuItemProps> = ({
  item,
  className,
  setVisible,
  visible,
  setSubItem,
  subKey,
}) => {
  const navigate = useRouter();
  const IconComponent = resolveIconComponent(item.iconName);
  const isActive = subKey?.slice(0, 1) === item.key && visible;

  const handleClick = (item: MenuItemType) => {
    if (!item.disabled && item.route) {
      navigate.push(item.route);
    }
  };

  const handleMouseEnter = () => {
    setVisible(true);
    if (item.children && item.children.length > 0) {
      setSubItem(item.children);
    } else {
      setSubItem(undefined);
    }
  };
  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div
      role="menu"
      tabIndex={0}
      className={twMerge(
        "hover:bg-secondary-light h-full",
        isActive && "bg-secondary-light"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        size="large"
        key={item.key}
        disabled={item.disabled}
        onClick={() => handleClick(item)}
        className={twMerge(
          "w-full px-3 p-4 transition justify-start",
          !item.disabled ? "cursor-pointer" : "cursor-not-allowed",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent />}
          <div>{item.title}</div>
          {item.children && (
            <ChevronDownIcon
              className={twMerge(
                " transform-all duration-200",
                isActive && "rotate-180"
              )}
              size={24}
            />
          )}
        </div>
      </Button>
    </div>
  );
};
