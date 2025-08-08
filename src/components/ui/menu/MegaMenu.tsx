import React from "react";
import { MenuItemPosition, MenuItemType } from "./types";
import Image from "next/image";
import { getMenuItemPosition } from "./utils";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { MegaMenuItem } from "./_components/MegaMenuItem";
import { MegaSubMenu } from "./_components/MegaSubMenu";

type MegaMenuProps = {
  data: MenuItemType[];
  menuItemPosition?: MenuItemPosition;
};
export const MegaMenu: React.FC<MegaMenuProps> = ({
  data,
  menuItemPosition = "center",
}) => {
  const navigate = useRouter();
  const [visible, setVisible] = React.useState(false);
  const [subItem, setSubItem] = React.useState<MenuItemType[] | undefined>();

  const handleNavigateMain = () => {
    navigate.push("/");
  };

  return (
    <div className="relative">
      <div
        className={twMerge(
          "flex flex-row items-center bg-white shadow-md",
          getMenuItemPosition(menuItemPosition)
        )}
      >
        <Image
          className="cursor-pointer"
          onClick={handleNavigateMain}
          width={48}
          height={48}
          src="/images/fb.png"
          alt="fb"
        />{" "}
        {data.map((menu) => {
          return (
            <MegaMenuItem
              key={menu.key}
              item={menu}
              subKey={subItem?.[0].key}
              setVisible={setVisible}
              setSubItem={setSubItem}
            />
          );
        })}
      </div>
      {subItem && (
        <MegaSubMenu
          subItem={subItem}
          visible={visible}
          setVisible={setVisible}
          setSubItem={setSubItem}
        />
      )}
    </div>
  );
};
