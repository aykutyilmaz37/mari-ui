import React from "react";
import { MenuItemType, SidebarPosition, SidebarVariant } from "../types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getWidthClass } from "../utils";
import { twMerge } from "tailwind-merge";
import { SidebarButton } from "./_components/SidebarButton";
import { SidebarMenu } from "./_components/SidebarMenu";

type SidebarProps = {
  data: MenuItemType[];
  variant?: SidebarVariant;
  position?: SidebarPosition;
  logo?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({
  data,
  variant = "click",
  position = "right",
  logo = "/images/fb.png",
}) => {
  const navigate = useRouter();
  const [visible, setVisible] = React.useState(false);

  const handleNavigateMain = () => {
    navigate.push("/");
  };

  const handleMouseEnter = () => {
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div
      className={twMerge(
        "fixed flex top-0 z-50 h-full  overflow-auto border-secondary-light transition-all duration-500",
        position === "right" && "right-0 flex-row-reverse",
        position === "left" && "left-0"
      )}
    >
      <aside
        onMouseEnter={variant === "hover" ? handleMouseEnter : undefined}
        onMouseLeave={variant === "hover" ? handleMouseLeave : undefined}
        className={twMerge(
          "h-full max-w-5xl bg-white overflow-auto border-secondary-light transition-all duration-500 py-4",
          position === "right" && "border-l-2",
          position === "left" && "border-r-2",
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
            <SidebarMenu data={data} />
        </nav>
      </aside>
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
