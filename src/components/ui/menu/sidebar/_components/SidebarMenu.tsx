import React from "react";
import { SidebarItem } from "./SidebarItem";
import { findActiveKeyByRoute } from "../../utils";
import { usePathname } from "next/navigation";
import { MenuItemType, SidebarPosition } from "../../types";
import { twMerge } from "tailwind-merge";

type SidebarMenuProps = {
  data: MenuItemType[];
  className?: string;
  setSubItem?: React.Dispatch<React.SetStateAction<MenuItemType[] | undefined>>;
  setSubVisible: (value: boolean) => void;
  visible: boolean;
  mega?: boolean;
  dropdown?: boolean;
  position?: SidebarPosition;
};
export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  data,
  className,
  setSubItem,
  setSubVisible,
  visible,
  mega,
  dropdown,
  position,
}) => {
  const pathname = usePathname();

  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const key = findActiveKeyByRoute(data, pathname);
    setActiveKey(key);
  }, [pathname, data]);

  return (
    <ul className={twMerge(className)}>
      {data?.map((item) => {
        return (
          <SidebarItem
            key={item.key}
            item={item}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            setSubItem={setSubItem}
            setSubVisible={setSubVisible}
            visible={visible}
            mega={mega}
            dropdown={dropdown}
            position={position}
          />
        );
      })}
    </ul>
  );
};
