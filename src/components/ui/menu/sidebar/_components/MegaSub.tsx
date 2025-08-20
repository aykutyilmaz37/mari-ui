import React from "react";
import { twMerge } from "tailwind-merge";
import { MenuItemType } from "../../types";
import { Card } from "@/components/ui/card";
import { resolveIconComponent } from "../../utils";
import { useRouter } from "next/navigation";

type MegaSubProps = {
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
  subItem: MenuItemType[];
  cardClassname?: string;
};

export const MegaSub: React.FC<MegaSubProps> = ({
  setSubVisible,
  subVisible,
  subItem,
  cardClassname,
}) => {
  const navigate = useRouter();

  return (
    <div
      role="menu"
      tabIndex={0}
      onMouseEnter={() => setSubVisible(true)}
      onMouseLeave={() => setSubVisible(false)}
      className={twMerge(
        "bg-secondary-light h-full overflow-hidden transition-all duration-300 ease-in-out",
        subVisible ? "w-6xl opacity-100" : "w-0 opacity-0"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full w-full">
        {subItem?.map((item) => {
          const IconComponent = resolveIconComponent(item.iconName);

          return (
            <Card
              className={twMerge(
                "flex flex-col w-full group hover:scale-101 transition-all duration-500 h-72",
                cardClassname
              )}
              key={item.key}
              onClick={() => navigate.push(item.route ?? "/")}
            >
              <span className="flex items-center gap-4 text-lg text-primary group-hover:text-info transition-all duration-500">
                {IconComponent && <IconComponent />} {item.title}
              </span>
              <span className="text-sm text-secondary group-hover:text-info transition-all duration-500">
                {item.description}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
