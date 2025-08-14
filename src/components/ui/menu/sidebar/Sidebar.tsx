import React from "react";
import { MenuItemType, SidebarPosition, SidebarVariant } from "../types";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { getWidthClass, findActiveKeyByRoute } from "../utils";
import { twMerge } from "tailwind-merge";
import { Button } from "../../button";
import { PlayIcon } from "lucide-react";
import { SidebarItem } from "./_components/SidebarItem";

type SidebarProps = {
  data: MenuItemType[];
  variant?: SidebarVariant;
  position?: SidebarPosition;
  logo?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({
  data,
  variant = "click",
  position = "left",
  logo = "/images/fb.png",
}) => {
  const navigate = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const key = findActiveKeyByRoute(data, pathname);
    setActiveKey(key);
  }, [pathname, data]);

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
        <span className="block min-h-0.5 w-full bg-secondary-light" />
        <nav>
          <ul>
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
        </nav>
      </aside>
      {variant === "click" && (
        <Button
          className={twMerge(
            "bg-secondary-light transition-all duration-500 ease-in-out w-8 h-8",
            position === "right" && "rounded-r-none ",
            position === "left" && "rounded-l-none "
          )}
          onClick={() => setVisible(!visible)}
        >
          <PlayIcon
            className={twMerge(
              "transition-transform duration-300 fill-secondary ",
              visible && position === "right" ? "rotate-0" : "rotate-180",
              visible && position === "left" ? "rotate-180" : "rotate-0"
            )}
          />
        </Button>
      )}
    </div>
  );
};
