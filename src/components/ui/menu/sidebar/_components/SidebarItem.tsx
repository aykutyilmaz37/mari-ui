import React from "react";
import { Button } from "@/components/ui/button";
import { getClassSidebar, isMenuItemActive, resolveIconComponent } from "../../utils";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { MenuItemType } from "../../types";
import { SidebarMenu } from "./SidebarMenu";

type SidebarItemProps = {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (value: string) => void;
};
export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  activeKey,
  setActiveKey,
}) => {
  const navigate = useRouter();
  const [subVisible, setSubVisible] = React.useState(false);

  const IconComponent = resolveIconComponent(item.iconName);

  const handleNavigateRoute = (item: MenuItemType) => {
    if (item.route) {
      navigate.push(item.route);
      setActiveKey(item.key);
    } else {
      setSubVisible(!subVisible);
    }
  };

  const activeClass = getClassSidebar(item, activeKey);

  React.useEffect(() => {
    if (item.children) {
      setSubVisible(isMenuItemActive(item, activeKey));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  return (
    <>
      <li
        className={twMerge(
          "text-primary cursor-pointer hover:bg-secondary-light transition-all ease-in-out duration-300",
          activeClass
        )}
      >
        <Button
          size="large"
          disabled={item.disabled}
          className={twMerge(
            "w-full justify-start overflow-hidden hover:text-info px-3 ",
            item.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            !item.disabled && isMenuItemActive(item, activeKey) && " text-info"
          )}
          htmlType="button"
          onClick={() => handleNavigateRoute(item)}
          icon={IconComponent && <IconComponent />}
        >
          <span className="ml-1 text-nowrap">{item.title}</span>
        </Button>
      </li>
      {item.children && (
        <SidebarMenu
          data={item.children}
          className={twMerge(
            "ml-2 overflow-hidden transition-all duration-300 ease-in-out",
            subVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        />
      )}
    </>
  );
};
