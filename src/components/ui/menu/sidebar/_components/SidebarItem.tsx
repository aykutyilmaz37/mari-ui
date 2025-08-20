import React from "react";
import { Button } from "@/components/ui/button";
import {
  getClassSidebar,
  isMenuItemActive,
  resolveIconComponent,
} from "../../utils";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { MenuItemType, SidebarPosition } from "../../types";
import { DropdownSub } from "./DropdownSub";
import { AccordionSub } from "./AccordionSub";

type SidebarItemProps = {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (value: string) => void;
  dropdown?: boolean;
  mega?: boolean;
  setSubItem?: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  setSubVisible: (value: boolean) => void;
  position: SidebarPosition;
};
export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  activeKey,
  setActiveKey,
  dropdown,
  mega,
  setSubItem,
  setSubVisible,
  position,
}) => {
  const navigate = useRouter();

  const IconComponent = resolveIconComponent(item.iconName);

  const [isOpen, setIsOpen] = React.useState(false);

  const handleNavigateRoute = (item: MenuItemType) => {
    console.log(item);

    if (item.route) {
      navigate.push(item.route);
      setActiveKey(item.key);
    }
  };

  const activeClass = getClassSidebar(item, activeKey);

  React.useEffect(() => {
    if (item.children) {
      setIsOpen(isMenuItemActive(item, activeKey));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const handleMouseEnter = () => {
    if (mega) {
      setSubVisible(true);
    }
    if (dropdown) {
      setIsOpen(true);
    }
    if (mega && item.children && item.children.length > 0) {
      setSubItem?.(item.children);
    } else {
      setSubItem?.(undefined);
    }
  };
  const handleMouseLeave = () => {
    if (mega) {
      setSubVisible(false);
    }
    if (dropdown) {
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    if (item.disabled) return;
    if (!mega && !dropdown && item.children && item.children.length > 0) {
      setIsOpen((prev) => !prev);
      return;
    }
    handleNavigateRoute(item);
  };
  return (
    <li
      className={twMerge(
        "text-primary cursor-pointer transition-all ease-in-out duration-300",
        activeClass
      )}
    >
      <Button
        size="large"
        disabled={item.disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={twMerge(
          "w-full justify-start overflow-hidden hover:text-info px-3 hover:bg-secondary-light",
          item.disabled ? "cursor-not-allowed" : "cursor-pointer",
          !item.disabled && isMenuItemActive(item, activeKey) && " text-info"
        )}
        htmlType="button"
        onClick={handleClick}
        icon={IconComponent && <IconComponent />}
      >
        <span className="ml-1 text-nowrap">{item.title}</span>
      </Button>
      {dropdown ? (
        <DropdownSub
          item={item}
          subVisible={isOpen}
          setSubVisible={setIsOpen}
          position={position}
        />
      ) : (
        <AccordionSub
          item={item}
          subVisible={isOpen}
          setSubVisible={setIsOpen}
        />
      )}
    </li>
  );
};
