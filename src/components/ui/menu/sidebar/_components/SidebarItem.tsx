import React from "react";
import { Button } from "@/components/ui/button";
import { resolveIconComponent } from "../../utils";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { MenuItemType } from "../../types";

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

  const IconComponent = resolveIconComponent(item.iconName);
  const handleNavigateRoute = (item: MenuItemType) => {
    navigate.push(item.route ?? "");
    setActiveKey(item.key);
  };

  return (
    <li
      className={twMerge(
        "text-primary cursor-pointer hover:bg-secondary-light transition-all ease-in-out duration-300",
        activeKey === item.key ? "bg-info-light text-white" : ""
      )}
    >
      <Button
        size="large"
        className={
          (twMerge(
            "overflow-hidden cursor-pointer hover:text-info px-3"
          ),
          activeKey === item.key ? " text-info" : "")
        }
        htmlType="button"
        onClick={() => handleNavigateRoute(item)}
        icon={IconComponent && <IconComponent />}
      >
        <span className="ml-1 text-nowrap">{item.title}</span>
      </Button>
    </li>
  );
};
