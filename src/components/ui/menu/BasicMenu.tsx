"use client";
import React from "react";
import { MenuItemType, MenuItemPosition } from "./types";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getMenuItemPosition } from "./utils";
import { BasicMenuItem } from "./_components/BasicMenuItem";
import { DropdownSubMenu } from "./_components/DropdownSubMenu";

type MenuProps = {
  data: MenuItemType[];
  menuItemPosition?: MenuItemPosition;
};

export const BasicMenu: React.FC<MenuProps> = ({
  data,
  menuItemPosition = "left",
}) => {
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const navigate = useRouter();

  const handleNavigateMain = () => {
    navigate.push("/");
  };

  React.useEffect(() => {
    if (data.length > 0 && !activeKey) {
      setActiveKey(data[0].key);
    }
  }, [data, activeKey]);

  return (
    <div
      className={twMerge(
        "flex flex-row gap-4 items-center bg-white sticky top-0 p-2 shadow-md",
        getMenuItemPosition(menuItemPosition)
      )}
    >
      <Image
        className="cursor-pointer"
        onClick={handleNavigateMain}
        width={72}
        height={72}
        src="/images/fb.png"
        alt="fb"
      />
      {data.map((item) => {
        return item.children ? (
          <DropdownSubMenu
            key={item.key}
            item={item}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
          />
        ) : (
          <BasicMenuItem
            key={item.key}
            item={item}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
          />
        );
      })}
    </div>
  );
};
