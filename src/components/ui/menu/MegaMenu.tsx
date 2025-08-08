import React from "react";
import { MenuItemJustify, MenuItemType, MenuPosition } from "./types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { MegaMenuItem } from "./_components/MegaMenuItem";
import { MegaSubMenu } from "./_components/MegaSubMenu";
import { getMenuItemJustify, getMenuPosition } from "./utils";

type MegaMenuProps = {
  data: MenuItemType[];
  menuItemPosition?: MenuItemJustify;
  menuPosition?: MenuPosition;
};
export const MegaMenu: React.FC<MegaMenuProps> = ({
  data,
  menuItemPosition = "center",
  menuPosition = "default",
}) => {
  const navigate = useRouter();
  const [visible, setVisible] = React.useState(false);
  const [subItem, setSubItem] = React.useState<MenuItemType[] | undefined>();

  const handleNavigateMain = () => {
    navigate.push("/");
  };

  return (
    <div className={twMerge("relative", getMenuPosition(menuPosition))}>
      <div
        className={twMerge(
          "flex flex-row items-center bg-white shadow-md",
          getMenuItemJustify(menuItemPosition)
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
              visible={visible}
              subKey={subItem?.[0].key}
              setVisible={setVisible}
              setSubItem={setSubItem}
            />
          );
        })}
      </div>
      <div
        className={twMerge(
          "transition-all duration-300 origin-top transform",
          visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {subItem && (
          <MegaSubMenu
            subItem={subItem}
            setVisible={setVisible}
            setSubItem={setSubItem}
          />
        )}
      </div>
    </div>
  );
};
