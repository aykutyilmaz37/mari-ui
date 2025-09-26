import React from "react";
import { MenuItemType, SidebarPosition, SidebarVariant } from "../types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getWidthClass } from "../utils";
import { twMerge } from "tailwind-merge";
import { SidebarButton } from "./_components/SidebarButton";
import { SidebarMenu } from "./_components/SidebarMenu";
import { MegaSub } from "./_components/MegaSub";

type SidebarProps = {
  data: MenuItemType[];
  variant?: SidebarVariant;
  position?: SidebarPosition;
  onlyIcon?: boolean;
  dropdown?: boolean;
  mega?: boolean;
  logo?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({
  data,
  variant = "hover",
  position = "left",
  onlyIcon = false,
  dropdown = false,
  mega = false,
  logo = "/images/fb.png",
}) => {
  const navigate = useRouter();
  const [visible, setVisible] = React.useState(false);
  const [subItem, setSubItem] = React.useState<MenuItemType[] | undefined>();
  const [subVisible, setSubVisible] = React.useState(false);

  const handleNavigateMain = () => {
    navigate.push("/");
  };

  const handleMouseEnter = () => {
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
    setSubVisible(false);
  };

  return (
    <div
      className={twMerge(
        "fixed flex top-0 z-50 h-full w-full overflow-auto border-secondary-light transition-all duration-500",
        position === "right" && "right-0 flex-row-reverse",
        position === "left" && "left-0"
      )}
    >
      <aside
        onMouseEnter={
          variant === "hover" && !onlyIcon ? handleMouseEnter : undefined
        }
        onMouseLeave={
          variant === "hover" && !onlyIcon ? handleMouseLeave : undefined
        }
        className={twMerge(
          "h-full max-w-5xl bg-white border-secondary-light transition-all duration-500 py-4",
          position === "right" && "border-l-2",
          position === "left" && "border-r-2",
          dropdown && visible ? "overflow-visible" : "overflow-auto ",
          getWidthClass(variant, visible)
        )}
      >
        <div className="w-12 flex-col items-center justify-center h-12">
          <Image
            className="cursor-pointer"
            onClick={handleNavigateMain}
            width={48}
            height={48}
            src={logo}
            alt="fb"
          />
        </div>
        <div className="min-h-0.5 w-full bg-secondary-light" />
        <nav>
          <SidebarMenu
            data={data}
            setSubItem={setSubItem}
            setSubVisible={setSubVisible}
            visible={visible}
            mega={mega}
            dropdown={dropdown}
            position={position}
          />
        </nav>
      </aside>
      {subItem && (
        <MegaSub
          setSubVisible={setSubVisible}
          subVisible={subVisible}
          subItem={subItem}
        />
      )}
      {variant === "click" && (
        <SidebarButton
          visible={visible}
          setVisible={setVisible}
          position={position}
        />
      )}
    </div>
  );
};
