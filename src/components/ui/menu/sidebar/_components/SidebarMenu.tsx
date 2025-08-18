import React from "react";
import { SidebarItem } from "./SidebarItem";
import { findActiveKeyByRoute } from "../../utils";
import { usePathname } from "next/navigation";
import { MenuItemType } from "../../types";
import { twMerge } from "tailwind-merge";

type SidebarMenuProps = {
  data: MenuItemType[];
  className?:string
};
export const SidebarMenu: React.FC<SidebarMenuProps> = ({ data,className }) => {
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
          />
        );
      })}
    </ul>
  );
};
